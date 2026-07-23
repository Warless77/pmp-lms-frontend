-- Extend the existing PMP question table without replacing learner content.
-- Existing columns include question_text, correct_index, and is_published.

alter table public.questions
  add column if not exists source_id text,
  add column if not exists answer_confidence numeric(4,3) not null default 0,
  add column if not exists review_status text not null default 'needs_review',
  add column if not exists source_reference text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'questions_review_status_check'
      and conrelid = 'public.questions'::regclass
  ) then
    alter table public.questions
      add constraint questions_review_status_check
      check (review_status in ('needs_review', 'approved', 'rejected'));
  end if;
end;
$$;

-- Preserve access to any existing published questions while requiring review
-- for newly imported records.
update public.questions
set review_status = case when is_published then 'approved' else 'needs_review' end
where review_status = 'needs_review';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'questions_source_id_key'
      and conrelid = 'public.questions'::regclass
  ) then
    alter table public.questions
      add constraint questions_source_id_key unique (source_id);
  end if;
end;
$$;

create index if not exists questions_published_domain_idx
  on public.questions (domain, id) where is_published = true;

alter table public.questions enable row level security;

drop policy if exists "Authenticated learners can read published questions" on public.questions;
create policy "Authenticated learners can read published questions"
  on public.questions for select to authenticated
  using (is_published = true and review_status = 'approved');

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions"
  on public.questions for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();
