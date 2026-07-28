-- Reliable, private PMP mock-exam sessions. Apply after the existing beta migrations.
create table if not exists public.pmp_mock_exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(), expires_at timestamptz not null,
  submitted_at timestamptz, status text not null default 'active' check (status in ('active','submitted','expired'))
);
create table if not exists public.pmp_mock_exam_session_questions (
  session_id uuid not null references public.pmp_mock_exam_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position integer not null check (position between 1 and 180),
  primary key (session_id, question_id), unique (session_id, position)
);
alter table public.pmp_mock_exam_sessions enable row level security;
alter table public.pmp_mock_exam_session_questions enable row level security;
drop policy if exists "Learners read own mock sessions" on public.pmp_mock_exam_sessions;
create policy "Learners read own mock sessions" on public.pmp_mock_exam_sessions for select to authenticated using (user_id = auth.uid());

create or replace function public.pmp_start_mock_exam(p_duration_seconds integer default 13800)
returns table (session_id uuid, started_at timestamptz, expires_at timestamptz, questions jsonb)
language plpgsql security definer set search_path = public as $$
declare v_session_id uuid; v_started_at timestamptz := now(); v_expires_at timestamptz := now() + make_interval(secs => greatest(900, least(coalesce(p_duration_seconds,13800),21600))); v_questions jsonb; v_count integer;
begin
  if not public.pmp_has_beta_access() then raise exception 'Private beta access is required'; end if;
  select count(*) into v_count from public.questions where is_published and review_status = 'approved';
  if v_count < 180 then raise exception 'At least 180 published questions are required to start a mock exam'; end if;
  insert into public.pmp_mock_exam_sessions (user_id, started_at, expires_at) values (auth.uid(),v_started_at,v_expires_at) returning id into v_session_id;
  insert into public.pmp_mock_exam_session_questions (session_id,question_id,position)
  select v_session_id,id,row_number() over ()::integer from (
    select id from public.questions where is_published and review_status='approved' and domain='people' order by random() limit 76
    union all select id from public.questions where is_published and review_status='approved' and domain='process' order by random() limit 90
    union all select id from public.questions where is_published and review_status='approved' and domain in ('business','business_environment') order by random() limit 14
  ) balanced;
  insert into public.pmp_mock_exam_session_questions (session_id,question_id,position)
  select v_session_id,q.id,existing.count + row_number() over ()::integer from public.questions q cross join (select count(*)::integer as count from public.pmp_mock_exam_session_questions where session_id=v_session_id) existing
  where q.is_published and q.review_status='approved' and not exists (select 1 from public.pmp_mock_exam_session_questions sq where sq.session_id=v_session_id and sq.question_id=q.id)
  order by random() limit greatest(0,180-(select count(*) from public.pmp_mock_exam_session_questions where session_id=v_session_id));
  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'domain',q.domain,'question_text',q.question_text,'options',case when jsonb_typeof(q.options::jsonb)='array' then q.options::jsonb else to_jsonb(q.options) end) order by sq.position),'[]'::jsonb) into v_questions
  from public.pmp_mock_exam_session_questions sq join public.questions q on q.id=sq.question_id where sq.session_id=v_session_id;
  return query select v_session_id,v_started_at,v_expires_at,v_questions;
end; $$;

create or replace function public.pmp_submit_mock_exam_session(p_session_id uuid,p_answers jsonb)
returns table (attempt_id uuid, score integer, total integer, review jsonb, expired boolean)
language plpgsql security definer set search_path = public as $$
declare v_attempt_id uuid; v_score integer; v_review jsonb; v_expired boolean;
begin
  if not public.pmp_has_beta_access() then raise exception 'Private beta access is required'; end if;
  select now() >= expires_at into v_expired from public.pmp_mock_exam_sessions where id=p_session_id and user_id=auth.uid() and status='active' for update;
  if not found then raise exception 'This exam session is no longer available'; end if;
  with assigned as (
    select sq.position,q.id as question_id,q.correct_index,q.explanation,(coalesce(p_answers,'{}'::jsonb)->>q.id::text)::integer as selected_index
    from public.pmp_mock_exam_session_questions sq join public.questions q on q.id=sq.question_id where sq.session_id=p_session_id
  ), saved as (
    insert into public.pmp_question_responses (user_id,question_id,selected_index,is_correct)
    select auth.uid(),question_id,selected_index,selected_index=correct_index from assigned where selected_index between 0 and 3
    on conflict (user_id,question_id) do update set selected_index=excluded.selected_index,is_correct=excluded.is_correct,answered_at=now() returning question_id
  )
  select count(*) filter (where selected_index=correct_index)::integer,coalesce(jsonb_agg(jsonb_build_object('question_id',question_id,'is_correct',coalesce(selected_index=correct_index,false),'correct_index',correct_index,'explanation',coalesce(explanation,''),'selected_index',selected_index) order by position),'[]'::jsonb) into v_score,v_review from assigned;
  insert into public.pmp_mock_attempts (user_id,score,total,elapsed_seconds)
  select auth.uid(),coalesce(v_score,0),180,greatest(0,extract(epoch from least(now(),expires_at)-started_at)::integer) from public.pmp_mock_exam_sessions where id=p_session_id returning id into v_attempt_id;
  update public.pmp_mock_exam_sessions set submitted_at=now(),status=case when v_expired then 'expired' else 'submitted' end where id=p_session_id;
  return query select v_attempt_id,coalesce(v_score,0),180,v_review,coalesce(v_expired,false);
end; $$;
revoke all on function public.pmp_start_mock_exam(integer) from public;
revoke all on function public.pmp_submit_mock_exam_session(uuid,jsonb) from public;
grant execute on function public.pmp_start_mock_exam(integer),public.pmp_submit_mock_exam_session(uuid,jsonb) to authenticated;

-- Short practice sets should feel fresh rather than always beginning with the
-- same records in the bank. This returns no answer key.
create or replace function public.pmp_get_practice_questions(p_limit integer default 20)
returns table (id uuid, domain text, question_text text, options jsonb)
language sql stable security definer set search_path = public as $$
  select q.id, q.domain, q.question_text,
    case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end
  from public.questions q
  where public.pmp_has_beta_access() and q.is_published and q.review_status = 'approved'
  order by random()
  limit greatest(5, least(coalesce(p_limit, 20), 50));
$$;
revoke all on function public.pmp_get_practice_questions(integer) from public;
grant execute on function public.pmp_get_practice_questions(integer) to authenticated;

create or replace function public.pmp_get_practice_questions_for_question(p_question_id uuid, p_limit integer default 20)
returns table (id uuid, domain text, question_text text, options jsonb)
language sql stable security definer set search_path = public as $$
  with target as (
    select q.id, q.domain, q.question_text, case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end as options, 0 as sort_order
    from public.questions q where q.id = p_question_id and q.is_published and q.review_status = 'approved' and public.pmp_has_beta_access()
  ), remainder as (
    select q.id, q.domain, q.question_text, case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end as options, 1 as sort_order
    from public.questions q where q.is_published and q.review_status = 'approved' and public.pmp_has_beta_access() and q.id <> p_question_id order by random() limit greatest(4, least(coalesce(p_limit,20),50)-1)
  ) select id,domain,question_text,options from (select * from target union all select * from remainder) questions order by sort_order;
$$;
revoke all on function public.pmp_get_practice_questions_for_question(uuid,integer) from public;
grant execute on function public.pmp_get_practice_questions_for_question(uuid,integer) to authenticated;
