-- One safe repair for practice grading and mock-exam RPCs.
-- This is additive/idempotent: it does not delete questions, answers, or attempts.

create table if not exists public.pmp_beta_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_level text not null default 'beta' check (access_level in ('beta', 'premium')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pmp_question_responses (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_index integer not null check (selected_index between 0 and 3),
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.pmp_mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null check (score >= 0), total integer not null check (total > 0),
  elapsed_seconds integer not null check (elapsed_seconds >= 0), completed_at timestamptz not null default now()
);

create table if not exists public.pmp_mock_exam_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(), expires_at timestamptz not null,
  submitted_at timestamptz, status text not null default 'active' check (status in ('active','submitted','expired'))
);

create table if not exists public.pmp_mock_exam_session_questions (
  session_id uuid not null references public.pmp_mock_exam_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position integer not null check (position between 1 and 180),
  primary key (session_id, question_id), unique (session_id, position)
);

alter table public.pmp_beta_entitlements enable row level security;
alter table public.pmp_question_responses enable row level security;
alter table public.pmp_mock_attempts enable row level security;
alter table public.pmp_mock_exam_sessions enable row level security;
alter table public.pmp_mock_exam_session_questions enable row level security;

create or replace function public.pmp_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.pmp_has_beta_access()
returns boolean language sql stable security definer set search_path = public as $$
  select public.pmp_is_admin() or exists (
    select 1 from public.pmp_beta_entitlements
    where user_id = auth.uid() and (expires_at is null or expires_at > now())
  );
$$;

create or replace function public.pmp_grade_practice_answer(p_question_id uuid, p_selected_index integer)
returns table (is_correct boolean, explanation text)
language plpgsql security definer set search_path = public as $$
declare v_correct integer; v_explanation text;
begin
  if not public.pmp_has_beta_access() then raise exception 'Private beta access is required'; end if;
  if p_selected_index not between 0 and 3 then raise exception 'Invalid answer selection'; end if;
  select correct_index, explanation into v_correct, v_explanation from public.questions
    where id = p_question_id and is_published and review_status = 'approved';
  if not found then raise exception 'Question is unavailable'; end if;
  insert into public.pmp_question_responses (user_id, question_id, selected_index, is_correct)
    values (auth.uid(), p_question_id, p_selected_index, p_selected_index = v_correct)
  on conflict (user_id, question_id) do update set selected_index = excluded.selected_index,
    is_correct = excluded.is_correct, answered_at = now();
  return query select p_selected_index = v_correct, coalesce(v_explanation, 'No explanation is available for this question.');
end; $$;

create or replace function public.pmp_start_mock_exam(p_duration_seconds integer default 13800)
returns table (session_id uuid, started_at timestamptz, expires_at timestamptz, questions jsonb)
language plpgsql security definer set search_path = public as $$
declare v_session_id uuid; v_started_at timestamptz := now(); v_expires_at timestamptz := now() + make_interval(secs => greatest(900, least(coalesce(p_duration_seconds, 13800), 21600))); v_questions jsonb; v_count integer;
begin
  if not public.pmp_has_beta_access() then raise exception 'Private beta access is required'; end if;
  select count(*) into v_count from public.questions where is_published and review_status = 'approved';
  if v_count < 180 then raise exception 'At least 180 published questions are required to start a mock exam'; end if;
  insert into public.pmp_mock_exam_sessions (user_id, started_at, expires_at)
    values (auth.uid(), v_started_at, v_expires_at) returning id into v_session_id;
  insert into public.pmp_mock_exam_session_questions (session_id, question_id, position)
  select v_session_id, id, row_number() over ()::integer from (
    (select id from public.questions where is_published and review_status = 'approved' and domain = 'people' order by random() limit 76)
    union all
    (select id from public.questions where is_published and review_status = 'approved' and domain = 'process' order by random() limit 90)
    union all
    (select id from public.questions where is_published and review_status = 'approved' and domain in ('business', 'business_environment') order by random() limit 14)
  ) balanced;
  select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'domain', q.domain, 'question_text', q.question_text, 'options', q.options) order by sq.position), '[]'::jsonb)
    into v_questions from public.pmp_mock_exam_session_questions sq join public.questions q on q.id = sq.question_id
    where sq.session_id = v_session_id;
  if jsonb_array_length(v_questions) <> 180 then raise exception 'Unable to assemble a complete 180-question exam'; end if;
  return query select v_session_id, v_started_at, v_expires_at, v_questions;
end; $$;

revoke all on function public.pmp_grade_practice_answer(uuid, integer) from public;
revoke all on function public.pmp_start_mock_exam(integer) from public;
grant execute on function public.pmp_grade_practice_answer(uuid, integer), public.pmp_start_mock_exam(integer) to authenticated;
