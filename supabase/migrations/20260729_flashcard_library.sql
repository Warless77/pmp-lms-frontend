-- Learner-safe 1,000-card PMP flashcard library.
-- A card is derived from a validated published question, with its answer and
-- explanation disclosed only to authenticated private-beta learners.

create or replace function public.pmp_get_flashcards(
  p_limit integer default 1000,
  p_domain text default null
)
returns table (
  id uuid,
  domain text,
  front text,
  back text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    q.id,
    q.domain,
    q.question_text as front,
    concat_ws(
      E'\n\n',
      concat(
        'Answer: ',
        chr(65 + q.correct_index),
        '. ',
        coalesce(q.options ->> q.correct_index, '')
      ),
      nullif(trim(coalesce(q.explanation, '')), '')
    ) as back
  from public.questions q
  where public.pmp_has_beta_access()
    and q.is_published = true
    and q.review_status = 'approved'
    and (p_domain is null or p_domain = '' or q.domain = p_domain)
  order by
    case q.domain
      when 'people' then 1
      when 'process' then 2
      when 'business_environment' then 3
      when 'business' then 3
      else 4
    end,
    q.id
  limit greatest(1, least(coalesce(p_limit, 1000), 1000));
$$;

revoke all on function public.pmp_get_flashcards(integer, text) from public;
grant execute on function public.pmp_get_flashcards(integer, text) to authenticated;
