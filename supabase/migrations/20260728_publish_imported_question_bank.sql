-- Make the imported PMP bank available to invited beta learners.
-- This intentionally affects only the records created by the supplied
-- PMBOOK importer. Existing manually managed questions are not changed.
-- Correct answers remain private: learner clients receive them only after
-- submitting an answer to the secure grading functions.

update public.questions
set
  review_status = 'approved',
  is_published = true
where source_id like 'pmbank-%'
  and review_status <> 'rejected';

-- The Question Bank needs the complete bank for search and filtering. The
-- application still requests only 180 questions for each PMP-length mock exam.
create or replace function public.pmp_get_learner_questions(p_limit integer default 50)
returns table (id uuid, domain text, question_text text, options jsonb)
language sql stable security definer set search_path = public as $$
  select q.id, q.domain, q.question_text,
    case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else to_jsonb(q.options) end
  from public.questions q
  where public.pmp_has_beta_access()
    and q.is_published = true and q.review_status = 'approved'
  order by q.domain, q.id
  limit greatest(1, least(coalesce(p_limit, 50), 2100));
$$;

revoke all on function public.pmp_get_learner_questions(integer) from public;
grant execute on function public.pmp_get_learner_questions(integer) to authenticated;

-- Verification: this should show the published total and its domain split.
select domain, count(*) as published_questions
from public.questions
where is_published = true and review_status = 'approved'
group by domain
order by domain;
