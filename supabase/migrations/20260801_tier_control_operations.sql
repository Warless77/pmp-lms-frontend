-- Operational tier control. Apply after 20260801_harden_learner_tier_control.sql.
-- This adds an auditable change history and learner-management RPCs. It does not
-- delete learner progress, questions, or existing entitlement records.

alter table public.pmp_beta_entitlements
  drop constraint if exists pmp_beta_entitlements_access_level_check;
alter table public.pmp_beta_entitlements
  add constraint pmp_beta_entitlements_access_level_check
  check (access_level in ('trial', 'standard', 'premium', 'revoked'));

create table if not exists public.pmp_entitlement_events (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  changed_by uuid references auth.users(id) on delete set null,
  previous_tier text,
  new_tier text not null check (new_tier in ('trial', 'standard', 'premium', 'revoked')),
  previous_expires_at timestamptz,
  expires_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists pmp_entitlement_events_learner_created_idx
  on public.pmp_entitlement_events (learner_id, created_at desc);
alter table public.pmp_entitlement_events enable row level security;
drop policy if exists "Admins read entitlement audit history" on public.pmp_entitlement_events;
create policy "Admins read entitlement audit history" on public.pmp_entitlement_events
  for select to authenticated using (public.pmp_is_admin());

-- The central authority for client display and gates. Usage data is calculated
-- in the database so the learner cannot reset a Trial limit in the browser.
drop function if exists public.pmp_get_learner_entitlement();
create function public.pmp_get_learner_entitlement()
returns table (
  tier text,
  expires_at timestamptz,
  flashcard_limit integer,
  practice_limit integer,
  practice_used integer,
  practice_remaining integer,
  question_bank_enabled boolean,
  mock_exam_enabled boolean,
  ai_coach_enabled boolean,
  modules_enabled boolean,
  analytics_enabled boolean,
  certificates_enabled boolean
)
language sql stable security definer set search_path = public as $$
  with access_record as (
    select case when public.pmp_is_admin() then 'premium' else e.access_level end as tier,
      case when public.pmp_is_admin() then null else e.expires_at end as expires_at
    from public.pmp_beta_entitlements e
    where e.user_id = auth.uid()
    union all
    select 'premium'::text, null::timestamptz
    where public.pmp_is_admin()
      and not exists (select 1 from public.pmp_beta_entitlements where user_id = auth.uid())
  ), resolved as (
    select case when tier in ('trial', 'standard', 'premium')
                     and (expires_at is null or expires_at > now()) then tier else 'none' end as tier,
           expires_at
    from access_record
    limit 1
  ), usage as (
    select count(*)::integer as practice_used
    from public.pmp_practice_answers
    where user_id = auth.uid()
  )
  select r.tier, r.expires_at,
    case r.tier when 'trial' then 20 when 'standard' then 1000 when 'premium' then 1000 else 0 end,
    case r.tier when 'trial' then 25 when 'standard' then null when 'premium' then null else 0 end,
    u.practice_used,
    case when r.tier = 'trial' then greatest(0, 25 - u.practice_used) else null end,
    r.tier in ('standard', 'premium'), r.tier = 'premium', r.tier = 'premium',
    r.tier in ('trial', 'standard', 'premium'), r.tier in ('standard', 'premium'), r.tier in ('standard', 'premium')
  from resolved r cross join usage u;
$$;

-- A single administrative write path provides validation, a Trial default,
-- explicit expiry handling, and a durable audit record.
create or replace function public.pmp_admin_change_learner_tier(
  p_email text,
  p_tier text,
  p_expires_at timestamptz default null,
  p_reason text default null
)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare
  v_user_id uuid;
  v_previous_tier text;
  v_previous_expiry timestamptz;
  v_expires_at timestamptz;
begin
  if not public.pmp_is_admin() then raise exception 'Administrator access is required'; end if;
  if lower(trim(p_tier)) not in ('trial', 'standard', 'premium', 'revoked') then
    raise exception 'Use trial, standard, premium, or revoked for learner access.';
  end if;
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));
  if v_user_id is null then raise exception 'The learner must register before a plan can be assigned'; end if;
  if v_user_id = auth.uid() and lower(trim(p_tier)) = 'revoked' then
    raise exception 'An administrator cannot revoke their own access.';
  end if;
  select access_level, expires_at into v_previous_tier, v_previous_expiry
  from public.pmp_beta_entitlements where user_id = v_user_id for update;
  v_expires_at := case
    when lower(trim(p_tier)) = 'trial' then coalesce(p_expires_at, now() + interval '7 days')
    when lower(trim(p_tier)) = 'revoked' then now()
    else p_expires_at
  end;
  insert into public.pmp_beta_entitlements (user_id, access_level, expires_at)
  values (v_user_id, lower(trim(p_tier)), v_expires_at)
  on conflict (user_id) do update set access_level = excluded.access_level,
    expires_at = excluded.expires_at, updated_at = now();
  insert into public.pmp_entitlement_events (
    learner_id, changed_by, previous_tier, new_tier, previous_expires_at, expires_at, reason
  ) values (
    v_user_id, auth.uid(), v_previous_tier, lower(trim(p_tier)), v_previous_expiry, v_expires_at,
    nullif(left(trim(coalesce(p_reason, '')), 500), '')
  );
  return v_user_id;
end;
$$;

-- Preserve existing clients while routing every tier write through the audited path.
create or replace function public.pmp_admin_set_learner_tier(p_email text, p_tier text, p_expires_at timestamptz default null)
returns uuid language plpgsql security definer set search_path = public, auth as $$
  select public.pmp_admin_change_learner_tier(p_email, p_tier, p_expires_at, 'Admin plan update');
$$;

create or replace function public.pmp_admin_revoke_beta_access(p_email text)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  perform public.pmp_admin_change_learner_tier(p_email, 'revoked', null, 'Admin revoked access');
end;
$$;

create or replace function public.pmp_admin_list_learner_entitlements(p_limit integer default 100)
returns table (
  email text, tier text, expires_at timestamptz, updated_at timestamptz,
  practice_used integer, practice_remaining integer, last_changed_at timestamptz, last_reason text
)
language sql stable security definer set search_path = public, auth as $$
  with learners as (
    select u.id, u.email, e.access_level, e.expires_at, e.updated_at
    from public.pmp_beta_entitlements e join auth.users u on u.id = e.user_id
  ), changes as (
    select distinct on (learner_id) learner_id, created_at, reason
    from public.pmp_entitlement_events order by learner_id, created_at desc
  ), practice as (
    select user_id, count(*)::integer as practice_used
    from public.pmp_practice_answers group by user_id
  )
  select l.email, l.access_level, l.expires_at, l.updated_at,
    coalesce(p.practice_used, 0),
    case when l.access_level = 'trial' then greatest(0, 25 - coalesce(p.practice_used, 0)) else null end,
    c.created_at, c.reason
  from learners l
  left join practice p on p.user_id = l.id
  left join changes c on c.learner_id = l.id
  where public.pmp_is_admin()
  order by l.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 200));
$$;

revoke all on function public.pmp_get_learner_entitlement(), public.pmp_admin_change_learner_tier(text,text,timestamptz,text), public.pmp_admin_list_learner_entitlements(integer) from public;
grant execute on function public.pmp_get_learner_entitlement(), public.pmp_admin_change_learner_tier(text,text,timestamptz,text), public.pmp_admin_list_learner_entitlements(integer) to authenticated;
