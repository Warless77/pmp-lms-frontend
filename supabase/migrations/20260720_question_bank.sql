-- PMP question bank. Run this migration in the Supabase SQL editor before
-- importing questions. Answers remain private to authenticated learners.

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  source_id text not null unique,
  domain text not null check (domain in ('people', 'process', 'business')),
  prompt text not null,
  options jsonb not null,
  correct_option_indices integer[] not null default '{}',
  explanation text,
  answer_confidence numeric(4,3) not null default 0,
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'approved', 'rejected')),
  published boolean not null default false,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_options_are_nonempty check (jsonb_array_length(options) between 2 and 5)
);

create index if not exists questions_published_domain_idx
  on public.questions (domain, id) where published = true;

alter table public.questions enable row level security;

drop policy if exists "Authenticated learners can read published questions" on public.questions;
create policy "Authenticated learners can read published questions"
  on public.questions for select to authenticated
  using (published = true and review_status = 'approved');

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions"
  on public.questions for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- This trigger is intentionally generic and is also useful for future admin edits.
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
