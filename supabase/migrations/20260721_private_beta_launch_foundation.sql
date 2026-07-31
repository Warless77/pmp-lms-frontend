-- Private-beta launch foundation.
-- Apply after 20260720_question_bank.sql. This deliberately does not enable
-- payments: access is granted only by an administrator to invited beta users.

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
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  completed_at timestamptz not null default now()
);

create table if not exists public.pmp_learner_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications boolean not null default true,
  dark_mode boolean not null default false,
  study_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.pmp_beta_entitlements enable row level security;
alter table public.pmp_question_responses enable row level security;
alter table public.pmp_mock_attempts enable row level security;
alter table public.pmp_learner_settings enable row level security;

create or replace function public.pmp_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.pmp_has_beta_access()
returns boolean language sql stable security definer set search_path = public as $$
  select public.pmp_is_admin() or exists (
    select 1 from public.pmp_beta_entitlements
    where user_id = auth.uid() and (expires_at is null or expires_at > now())
  );
$$;

-- Learners can read their own learning records, but not grant themselves access.
drop policy if exists "Learners read own beta entitlement" on public.pmp_beta_entitlements;
create policy "Learners read own beta entitlement" on public.pmp_beta_entitlements
  for select to authenticated using (user_id = auth.uid() or public.pmp_is_admin());
drop policy if exists "Admins manage beta entitlements" on public.pmp_beta_entitlements;
create policy "Admins manage beta entitlements" on public.pmp_beta_entitlements
  for all to authenticated using (public.pmp_is_admin()) with check (public.pmp_is_admin());

drop policy if exists "Learners manage own responses" on public.pmp_question_responses;
create policy "Learners read own responses" on public.pmp_question_responses
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Learners read own mock attempts" on public.pmp_mock_attempts;
create policy "Learners read own mock attempts" on public.pmp_mock_attempts
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Learners manage own settings" on public.pmp_learner_settings;
create policy "Learners manage own settings" on public.pmp_learner_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Answer keys are never selectable by learners. Server-side functions below
-- run with controlled privileges and only return results after a submission.
drop policy if exists "Authenticated learners can read published questions" on public.questions;
drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions" on public.questions
  for all to authenticated using (public.pmp_is_admin()) with check (public.pmp_is_admin());

create or replace function public.pmp_get_learner_questions(p_limit integer default 50)
returns table (id uuid, domain text, question_text text, options jsonb)
language sql stable security definer set search_path = public as $$
  select q.id, q.domain, q.question_text,
    case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end
  from public.questions q
  where public.pmp_has_beta_access()
    and q.is_published = true and q.review_status = 'approved'
  order by q.id
  limit greatest(1, least(coalesce(p_limit, 50), 180));
$$;

create or replace function public.pmp_grade_practice_answer(p_question_id uuid, p_selected_index integer)
returns table (is_correct boolean, explanation text)
language plpgsql security definer set search_path = public as $$
declare v_correct integer; v_explanation text;
begin
  if not public.pmp_has_beta_access() then raise exception 'Private beta access is required'; end if;
  select correct_index, explanation into v_correct, v_explanation
  from public.questions
  where id = p_question_id and is_published = true and review_status = 'approved';
  if not found then raise exception 'Question is unavailable'; end if;
  insert into public.pmp_question_responses (user_id, question_id, selected_index, is_correct)
  values (auth.uid(), p_question_id, p_selected_index, p_selected_index = v_correct)
  on conflict (user_id, question_id) do update set
    selected_index = excluded.selected_index, is_correct = excluded.is_correct, answered_at = now();
  return query select p_selected_index = v_correct, coalesce(v_explanation, 'No explanation is available for this question.');
end;
$$;

create or replace function public.pmp_submit_mock_attempt(p_answers jsonb, p_elapsed_seconds integer)
returns table (attempt_id uuid, score integer, total integer)
language plpgsql security definer set search_path = public as $$
declare v_attempt_id uuid; v_score integer; v_total integer;
begin
  if not public.pmp_has_beta_access() then raise exception 'Private beta access is required'; end if;
  with submitted as (
    select key::uuid as question_id, value::integer as selected_index from jsonb_each_text(coalesce(p_answers, '{}'::jsonb))
  ), eligible as (
    select s.question_id, s.selected_index, q.correct_index
    from submitted s join public.questions q on q.id = s.question_id
    where q.is_published = true and q.review_status = 'approved'
  ), saved as (
    insert into public.pmp_question_responses (user_id, question_id, selected_index, is_correct)
    select auth.uid(), question_id, selected_index, selected_index = correct_index from eligible
    on conflict (user_id, question_id) do update set selected_index = excluded.selected_index, is_correct = excluded.is_correct, answered_at = now()
    returning is_correct
  ) select count(*), count(*) filter (where is_correct) into v_total, v_score from saved;
  if v_total = 0 then raise exception 'Submit at least one valid answer'; end if;
  insert into public.pmp_mock_attempts (user_id, score, total, elapsed_seconds)
  values (auth.uid(), v_score, v_total, greatest(0, coalesce(p_elapsed_seconds, 0))) returning id into v_attempt_id;
  return query select v_attempt_id, v_score, v_total;
end;
$$;

create or replace function public.pmp_get_learning_summary()
returns table (questions_answered integer, correct_answers integer, mock_attempts jsonb)
language sql stable security definer set search_path = public as $$
  select
    (select count(*)::integer from public.pmp_question_responses where user_id = auth.uid()),
    (select count(*)::integer from public.pmp_question_responses where user_id = auth.uid() and is_correct),
    coalesce((select jsonb_agg(jsonb_build_object('score', score, 'total', total, 'elapsedSeconds', elapsed_seconds, 'completedAt', completed_at) order by completed_at desc)
      from (select score, total, elapsed_seconds, completed_at from public.pmp_mock_attempts where user_id = auth.uid() order by completed_at desc limit 10) a), '[]'::jsonb);
$$;

create or replace function public.pmp_get_domain_performance()
returns table (domain text, questions_answered integer, correct_answers integer)
language sql stable security definer set search_path = public as $$
  select q.domain, count(r.question_id)::integer,
    count(r.question_id) filter (where r.is_correct)::integer
  from public.pmp_question_responses r
  join public.questions q on q.id = r.question_id
  where r.user_id = auth.uid()
  group by q.domain;
$$;

create or replace function public.pmp_admin_overview()
returns table (published_questions integer, awaiting_review integer, beta_learners integer, completed_mock_attempts integer)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  return query select
    (select count(*)::integer from public.questions where is_published and review_status = 'approved'),
    (select count(*)::integer from public.questions where review_status = 'needs_review'),
    (select count(*)::integer from public.pmp_beta_entitlements where expires_at is null or expires_at > now()),
    (select count(*)::integer from public.pmp_mock_attempts);
end;
$$;

create or replace function public.pmp_admin_review_queue(p_limit integer default 10)
returns table (id uuid, source_id text, domain text, question_text text, options jsonb, correct_index integer, explanation text, answer_confidence numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  return query select q.id, q.source_id, q.domain, q.question_text,
    case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end,
    q.correct_index, q.explanation, q.answer_confidence
  from public.questions q where q.review_status = 'needs_review'
  order by q.answer_confidence desc, q.id limit greatest(1, least(coalesce(p_limit, 10), 50));
end;
$$;

create or replace function public.pmp_admin_set_question_review(p_question_id uuid, p_status text, p_publish boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  if p_status not in ('needs_review', 'approved', 'rejected') then raise exception 'Invalid review status'; end if;
  update public.questions set review_status = p_status, is_published = (p_status = 'approved' and p_publish)
  where id = p_question_id;
  if not found then raise exception 'Question was not found'; end if;
end;
$$;

create or replace function public.pmp_admin_grant_beta_access(p_email text, p_access_level text default 'beta', p_expires_at timestamptz default null)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare v_user_id uuid;
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  if p_access_level not in ('beta', 'premium') then raise exception 'Invalid access level'; end if;
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));
  if v_user_id is null then raise exception 'The learner must register before access can be granted'; end if;
  insert into public.pmp_beta_entitlements (user_id, access_level, expires_at)
  values (v_user_id, p_access_level, p_expires_at)
  on conflict (user_id) do update set access_level = excluded.access_level, expires_at = excluded.expires_at, updated_at = now();
  return v_user_id;
end;
$$;

create or replace function public.pmp_admin_revoke_beta_access(p_email text)
returns void language plpgsql security definer set search_path = public, auth as $$
declare v_user_id uuid;
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));
  if v_user_id is null then raise exception 'Learner was not found'; end if;
  delete from public.pmp_beta_entitlements where user_id = v_user_id;
end;
$$;

revoke all on function public.pmp_get_learner_questions(integer) from public;
revoke all on function public.pmp_grade_practice_answer(uuid, integer) from public;
revoke all on function public.pmp_submit_mock_attempt(jsonb, integer) from public;
revoke all on function public.pmp_get_learning_summary() from public;
revoke all on function public.pmp_admin_overview() from public;
revoke all on function public.pmp_admin_review_queue(integer) from public;
revoke all on function public.pmp_admin_set_question_review(uuid, text, boolean) from public;
revoke all on function public.pmp_admin_grant_beta_access(text, text, timestamptz) from public;
revoke all on function public.pmp_admin_revoke_beta_access(text) from public;
grant execute on function public.pmp_get_learner_questions(integer), public.pmp_grade_practice_answer(uuid, integer), public.pmp_submit_mock_attempt(jsonb, integer), public.pmp_get_learning_summary() to authenticated;
grant execute on function public.pmp_get_domain_performance() to authenticated;
grant execute on function public.pmp_admin_overview() to authenticated;
grant execute on function public.pmp_admin_review_queue(integer), public.pmp_admin_set_question_review(uuid, text, boolean) to authenticated;
grant execute on function public.pmp_admin_grant_beta_access(text, text, timestamptz) to authenticated;
grant execute on function public.pmp_admin_revoke_beta_access(text) to authenticated;
