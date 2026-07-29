-- Database-enforced learner plans. Apply after the private-beta and mock-exam migrations.
-- Safe for the existing beta: current beta users are moved to Premium so they do not lose access.

alter table public.pmp_beta_entitlements
  drop constraint if exists pmp_beta_entitlements_access_level_check;
alter table public.pmp_beta_entitlements
  add constraint pmp_beta_entitlements_access_level_check
  check (access_level in ('trial', 'standard', 'premium'));

update public.pmp_beta_entitlements
set access_level = 'premium', updated_at = now()
where access_level = 'beta';

create table if not exists public.pmp_practice_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_index integer not null check (selected_index between 0 and 3),
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);
create index if not exists pmp_practice_answers_user_answered_at_idx
  on public.pmp_practice_answers (user_id, answered_at desc);
alter table public.pmp_practice_answers enable row level security;
drop policy if exists "Learners read own practice answer history" on public.pmp_practice_answers;
create policy "Learners read own practice answer history" on public.pmp_practice_answers
  for select to authenticated using (user_id = auth.uid());

create or replace function public.pmp_current_tier()
returns text language sql stable security definer set search_path = public as $$
  select case
    when public.pmp_is_admin() then 'premium'
    else coalesce((
      select access_level from public.pmp_beta_entitlements
      where user_id = auth.uid() and (expires_at is null or expires_at > now())
    ), 'none')
  end;
$$;

create or replace function public.pmp_get_learner_entitlement()
returns table (tier text, expires_at timestamptz, flashcard_limit integer, practice_limit integer, question_bank_enabled boolean, mock_exam_enabled boolean, ai_coach_enabled boolean)
language sql stable security definer set search_path = public as $$
  select
    public.pmp_current_tier(),
    case when public.pmp_is_admin() then null else e.expires_at end,
    case public.pmp_current_tier() when 'trial' then 20 when 'standard' then 1000 when 'premium' then 1000 else 0 end,
    case public.pmp_current_tier() when 'trial' then 25 when 'standard' then null when 'premium' then null else 0 end,
    public.pmp_current_tier() in ('standard', 'premium'),
    public.pmp_current_tier() = 'premium',
    public.pmp_current_tier() = 'premium'
  from public.pmp_beta_entitlements e
  where e.user_id = auth.uid()
  union all
  select public.pmp_current_tier(), null, 1000, null, true, true, true
  where public.pmp_is_admin() and not exists (select 1 from public.pmp_beta_entitlements where user_id = auth.uid());
$$;

create or replace function public.pmp_has_beta_access()
returns boolean language sql stable security definer set search_path = public as $$
  select public.pmp_current_tier() in ('trial', 'standard', 'premium');
$$;

create or replace function public.pmp_get_learner_questions(p_limit integer default 50)
returns table (id uuid, domain text, question_text text, options jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.pmp_current_tier() not in ('standard', 'premium') then
    raise exception 'Your plan does not include the Question Bank. Upgrade to Standard or Premium.';
  end if;
  return query
    select q.id, q.domain, q.question_text,
      case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end
    from public.questions q
    where q.is_published and q.review_status = 'approved'
    order by q.domain, q.id
    limit greatest(1, least(coalesce(p_limit, 50), 2100));
end;
$$;

create or replace function public.pmp_get_flashcards(p_limit integer default 1000, p_domain text default null)
returns table (id uuid, domain text, front text, back text)
language sql stable security definer set search_path = public as $$
  select q.id, q.domain, q.question_text,
    concat_ws(E'\n\n', concat('Answer: ', chr(65 + q.correct_index), '. ', coalesce(q.options ->> q.correct_index, '')), nullif(trim(coalesce(q.explanation, '')), ''))
  from public.questions q
  where public.pmp_has_beta_access()
    and q.is_published and q.review_status = 'approved'
    and (p_domain is null or p_domain = '' or q.domain = p_domain)
  order by case q.domain when 'people' then 1 when 'process' then 2 when 'business_environment' then 3 when 'business' then 3 else 4 end, q.id
  limit least(
    greatest(1, least(coalesce(p_limit, 1000), 1000)),
    case public.pmp_current_tier() when 'trial' then 20 when 'standard' then 1000 when 'premium' then 1000 else 0 end
  );
$$;

create or replace function public.pmp_get_practice_questions(p_limit integer default 20)
returns table (id uuid, domain text, question_text text, options jsonb)
language plpgsql stable security definer set search_path = public as $$
declare v_remaining integer;
begin
  if not public.pmp_has_beta_access() then raise exception 'An active learning plan is required'; end if;
  if public.pmp_current_tier() = 'trial' then
    select 25 - count(*)::integer into v_remaining from public.pmp_practice_answers where user_id = auth.uid();
    if v_remaining <= 0 then raise exception 'Your 25 Trial practice questions are complete. Upgrade to continue.'; end if;
  else v_remaining := 50; end if;
  return query select q.id, q.domain, q.question_text,
    case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end
  from public.questions q where q.is_published and q.review_status = 'approved'
  order by random() limit least(greatest(1, least(coalesce(p_limit, 20), 50)), v_remaining);
end;
$$;

create or replace function public.pmp_get_practice_questions_for_question(p_question_id uuid, p_limit integer default 20)
returns table (id uuid, domain text, question_text text, options jsonb)
language sql stable security definer set search_path = public as $$
  select * from public.pmp_get_practice_questions(p_limit);
$$;

create or replace function public.pmp_grade_practice_answer(p_question_id uuid, p_selected_index integer)
returns table (is_correct boolean, explanation text)
language plpgsql security definer set search_path = public as $$
declare v_correct integer; v_explanation text;
begin
  if not public.pmp_has_beta_access() then raise exception 'An active learning plan is required'; end if;
  if p_selected_index not between 0 and 3 then raise exception 'Invalid answer selection'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if public.pmp_current_tier() = 'trial' and (select count(*) from public.pmp_practice_answers where user_id = auth.uid()) >= 25 then
    raise exception 'Your 25 Trial practice questions are complete. Upgrade to continue.';
  end if;
  select q.correct_index, q.explanation into v_correct, v_explanation from public.questions q
  where q.id = p_question_id and q.is_published and q.review_status = 'approved';
  if not found then raise exception 'Question is unavailable'; end if;
  insert into public.pmp_practice_answers (user_id, question_id, selected_index, is_correct)
  values (auth.uid(), p_question_id, p_selected_index, p_selected_index = v_correct);
  insert into public.pmp_question_responses (user_id, question_id, selected_index, is_correct)
  values (auth.uid(), p_question_id, p_selected_index, p_selected_index = v_correct)
  on conflict (user_id, question_id) do update set selected_index = excluded.selected_index, is_correct = excluded.is_correct, answered_at = now();
  return query select p_selected_index = v_correct, coalesce(v_explanation, 'No explanation is available for this question.');
end;
$$;

create or replace function public.pmp_start_mock_exam(p_duration_seconds integer default 13800)
returns table (session_id uuid, started_at timestamptz, expires_at timestamptz, questions jsonb)
language plpgsql security definer set search_path = public as $$
declare v_session_id uuid; v_started_at timestamptz := now(); v_expires_at timestamptz := now() + make_interval(secs => greatest(900, least(coalesce(p_duration_seconds, 13800), 21600))); v_questions jsonb; v_count integer;
begin
  if public.pmp_current_tier() <> 'premium' then raise exception 'Mock Exams are available with Premium.'; end if;
  select count(*) into v_count from public.questions where is_published and review_status = 'approved';
  if v_count < 180 then raise exception 'At least 180 published questions are required to start a mock exam'; end if;
  insert into public.pmp_mock_exam_sessions (user_id, started_at, expires_at) values (auth.uid(), v_started_at, v_expires_at) returning id into v_session_id;
  insert into public.pmp_mock_exam_session_questions (session_id, question_id, position)
  select v_session_id, id, row_number() over ()::integer from (
    (select id from public.questions where is_published and review_status = 'approved' and domain = 'people' order by random() limit 76)
    union all (select id from public.questions where is_published and review_status = 'approved' and domain = 'process' order by random() limit 90)
    union all (select id from public.questions where is_published and review_status = 'approved' and domain in ('business', 'business_environment') order by random() limit 14)
  ) balanced;
  select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'domain', q.domain, 'question_text', q.question_text, 'options', q.options) order by sq.position), '[]'::jsonb) into v_questions
  from public.pmp_mock_exam_session_questions sq join public.questions q on q.id = sq.question_id where sq.session_id = v_session_id;
  return query select v_session_id, v_started_at, v_expires_at, v_questions;
end;
$$;

create or replace function public.pmp_admin_set_learner_tier(p_email text, p_tier text, p_expires_at timestamptz default null)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare v_user_id uuid; v_expires_at timestamptz;
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  if p_tier not in ('trial', 'standard', 'premium') then raise exception 'Invalid learner tier'; end if;
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));
  if v_user_id is null then raise exception 'The learner must register before a plan can be assigned'; end if;
  v_expires_at := case when p_tier = 'trial' then coalesce(p_expires_at, now() + interval '7 days') else p_expires_at end;
  insert into public.pmp_beta_entitlements (user_id, access_level, expires_at) values (v_user_id, p_tier, v_expires_at)
  on conflict (user_id) do update set access_level = excluded.access_level, expires_at = excluded.expires_at, updated_at = now();
  return v_user_id;
end;
$$;

revoke all on function public.pmp_get_learner_entitlement(), public.pmp_current_tier(), public.pmp_get_learner_questions(integer), public.pmp_get_flashcards(integer, text), public.pmp_get_practice_questions(integer), public.pmp_get_practice_questions_for_question(uuid, integer), public.pmp_grade_practice_answer(uuid, integer), public.pmp_start_mock_exam(integer), public.pmp_admin_set_learner_tier(text, text, timestamptz) from public;
grant execute on function public.pmp_get_learner_entitlement(), public.pmp_current_tier(), public.pmp_get_learner_questions(integer), public.pmp_get_flashcards(integer, text), public.pmp_get_practice_questions(integer), public.pmp_get_practice_questions_for_question(uuid, integer), public.pmp_grade_practice_answer(uuid, integer), public.pmp_start_mock_exam(integer), public.pmp_admin_set_learner_tier(text, text, timestamptz) to authenticated;
