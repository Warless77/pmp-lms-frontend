-- Secure post-submission mock-exam review.
-- Correct answers remain hidden until a learner submits an attempt.

create or replace function public.pmp_submit_mock_attempt_review(
  p_answers jsonb,
  p_elapsed_seconds integer
)
returns table (attempt_id uuid, score integer, total integer, review jsonb)
language plpgsql security definer set search_path = public as $$
declare
  v_attempt_id uuid;
  v_score integer;
  v_total integer;
  v_review jsonb;
begin
  if not public.pmp_has_beta_access() then
    raise exception 'Private beta access is required';
  end if;

  with submitted as (
    select key::uuid as question_id, value::integer as selected_index
    from jsonb_each_text(coalesce(p_answers, '{}'::jsonb))
  ), eligible as (
    select s.question_id, s.selected_index, q.correct_index, q.explanation
    from submitted s
    join public.questions q on q.id = s.question_id
    where q.is_published = true and q.review_status = 'approved'
  ), saved as (
    insert into public.pmp_question_responses (user_id, question_id, selected_index, is_correct)
    select auth.uid(), question_id, selected_index, selected_index = correct_index
    from eligible
    on conflict (user_id, question_id) do update set
      selected_index = excluded.selected_index,
      is_correct = excluded.is_correct,
      answered_at = now()
    returning question_id, selected_index, is_correct
  ), reviewed as (
    select s.question_id, s.selected_index, s.is_correct, e.correct_index, e.explanation
    from saved s join eligible e using (question_id)
  )
  select
    count(*)::integer,
    count(*) filter (where is_correct)::integer,
    coalesce(jsonb_agg(jsonb_build_object(
      'question_id', question_id,
      'is_correct', is_correct,
      'correct_index', correct_index,
      'explanation', coalesce(explanation, '')
    ) order by question_id), '[]'::jsonb)
  into v_total, v_score, v_review
  from reviewed;

  if v_total = 0 then
    raise exception 'Submit at least one valid answer';
  end if;

  insert into public.pmp_mock_attempts (user_id, score, total, elapsed_seconds)
  values (auth.uid(), v_score, v_total, greatest(0, coalesce(p_elapsed_seconds, 0)))
  returning id into v_attempt_id;

  return query select v_attempt_id, v_score, v_total, v_review;
end;
$$;

revoke all on function public.pmp_submit_mock_attempt_review(jsonb, integer) from public;
grant execute on function public.pmp_submit_mock_attempt_review(jsonb, integer) to authenticated;
