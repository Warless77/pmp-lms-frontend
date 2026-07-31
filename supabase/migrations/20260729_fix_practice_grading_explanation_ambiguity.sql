-- Fix PostgreSQL's ambiguous `explanation` reference in the practice grader.
-- Safe to run after the existing beta migrations. It does not modify questions,
-- answer keys, attempts, or learner progress.

create or replace function public.pmp_grade_practice_answer(
  p_question_id uuid,
  p_selected_index integer
)
returns table (is_correct boolean, explanation text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct integer;
  v_explanation text;
begin
  if not public.pmp_has_beta_access() then
    raise exception 'Private beta access is required';
  end if;

  if p_selected_index not between 0 and 3 then
    raise exception 'Invalid answer selection';
  end if;

  select q.correct_index, q.explanation
    into v_correct, v_explanation
  from public.questions as q
  where q.id = p_question_id
    and q.is_published
    and q.review_status = 'approved';

  if not found then
    raise exception 'Question is unavailable';
  end if;

  insert into public.pmp_question_responses (
    user_id, question_id, selected_index, is_correct
  )
  values (
    auth.uid(), p_question_id, p_selected_index, p_selected_index = v_correct
  )
  on conflict (user_id, question_id) do update
    set selected_index = excluded.selected_index,
        is_correct = excluded.is_correct,
        answered_at = now();

  return query
    select p_selected_index = v_correct,
           coalesce(v_explanation, 'No explanation is available for this question.');
end;
$$;

revoke all on function public.pmp_grade_practice_answer(uuid, integer) from public;
grant execute on function public.pmp_grade_practice_answer(uuid, integer) to authenticated;
