-- Tier-control hardening. Apply after 20260729_enforced_learner_tiers.sql.
-- This is additive and idempotent: it preserves learners and their activity.
-- The database remains the authority; the React gates are only learner guidance.

alter table public.pmp_beta_entitlements
  drop constraint if exists pmp_beta_entitlements_access_level_check;
alter table public.pmp_beta_entitlements
  add constraint pmp_beta_entitlements_access_level_check
  check (access_level in ('trial', 'standard', 'premium'));

-- Replace the old return signature so every client receives one trusted,
-- complete capability record. Administrators are always Premium.
drop function if exists public.pmp_get_learner_entitlement();
create function public.pmp_get_learner_entitlement()
returns table (
  tier text,
  expires_at timestamptz,
  flashcard_limit integer,
  practice_limit integer,
  question_bank_enabled boolean,
  mock_exam_enabled boolean,
  ai_coach_enabled boolean,
  modules_enabled boolean,
  analytics_enabled boolean,
  certificates_enabled boolean
)
language sql stable security definer set search_path = public as $$
  with current_access as (
    select public.pmp_current_tier() as tier,
      case when public.pmp_is_admin() then null else e.expires_at end as expires_at
    from public.pmp_beta_entitlements e where e.user_id = auth.uid()
    union all
    select 'premium'::text, null::timestamptz
    where public.pmp_is_admin()
      and not exists (select 1 from public.pmp_beta_entitlements where user_id = auth.uid())
  )
  select
    tier,
    expires_at,
    case tier when 'trial' then 20 when 'standard' then 1000 when 'premium' then 1000 else 0 end,
    case tier when 'trial' then 25 when 'standard' then null when 'premium' then null else 0 end,
    tier in ('standard', 'premium'),
    tier = 'premium',
    tier = 'premium',
    tier in ('trial', 'standard', 'premium'),
    tier in ('standard', 'premium'),
    tier in ('standard', 'premium')
  from current_access
  limit 1;
$$;

-- A learner downgraded while a mock is open cannot submit or expose its result.
create or replace function public.pmp_submit_mock_exam_session(p_session_id uuid,p_answers jsonb)
returns table (attempt_id uuid, score integer, total integer, review jsonb, expired boolean)
language plpgsql security definer set search_path = public as $$
declare v_attempt_id uuid; v_score integer; v_review jsonb; v_expired boolean;
begin
  if public.pmp_current_tier() <> 'premium' then
    raise exception 'Mock Exams are available with Premium.';
  end if;
  select now() >= expires_at into v_expired
  from public.pmp_mock_exam_sessions
  where id=p_session_id and user_id=auth.uid() and status='active'
  for update;
  if not found then raise exception 'This exam session is no longer available'; end if;
  with assigned as (
    select sq.position,q.id as question_id,q.correct_index,q.explanation,
      (coalesce(p_answers,'{}'::jsonb)->>q.id::text)::integer as selected_index
    from public.pmp_mock_exam_session_questions sq
    join public.questions q on q.id=sq.question_id
    where sq.session_id=p_session_id
  ), saved as (
    insert into public.pmp_question_responses (user_id,question_id,selected_index,is_correct)
    select auth.uid(),question_id,selected_index,selected_index=correct_index
    from assigned where selected_index between 0 and 3
    on conflict (user_id,question_id) do update
      set selected_index=excluded.selected_index,is_correct=excluded.is_correct,answered_at=now()
    returning question_id
  )
  select count(*) filter (where selected_index=correct_index)::integer,
    coalesce(jsonb_agg(jsonb_build_object(
      'question_id',question_id,'is_correct',coalesce(selected_index=correct_index,false),
      'correct_index',correct_index,'explanation',coalesce(explanation,''),
      'selected_index',selected_index) order by position),'[]'::jsonb)
  into v_score,v_review from assigned;
  insert into public.pmp_mock_attempts (user_id,score,total,elapsed_seconds)
  select auth.uid(),coalesce(v_score,0),180,
    greatest(0,extract(epoch from least(now(),expires_at)-started_at)::integer)
  from public.pmp_mock_exam_sessions where id=p_session_id
  returning id into v_attempt_id;
  update public.pmp_mock_exam_sessions
  set submitted_at=now(),status=case when v_expired then 'expired' else 'submitted' end
  where id=p_session_id;
  return query select v_attempt_id,coalesce(v_score,0),180,v_review,coalesce(v_expired,false);
end;
$$;

-- Keep the legacy admin RPC safe for callers that have not upgraded yet.
create or replace function public.pmp_admin_grant_beta_access(
  p_email text,
  p_access_level text default 'trial',
  p_expires_at timestamptz default null
)
returns uuid language plpgsql security definer set search_path = public, auth as $$
begin
  if p_access_level not in ('trial', 'standard', 'premium') then
    raise exception 'Use trial, standard, or premium for learner access.';
  end if;
  return public.pmp_admin_set_learner_tier(p_email, p_access_level, p_expires_at);
end;
$$;

revoke all on function public.pmp_get_learner_entitlement(), public.pmp_submit_mock_exam_session(uuid,jsonb), public.pmp_admin_grant_beta_access(text,text,timestamptz) from public;
grant execute on function public.pmp_get_learner_entitlement(), public.pmp_submit_mock_exam_session(uuid,jsonb), public.pmp_admin_grant_beta_access(text,text,timestamptz) to authenticated;
