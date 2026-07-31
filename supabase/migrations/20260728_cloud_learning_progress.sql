-- Cloud-backed learner progress for the private beta.
-- This migration is additive and keeps existing question and mock-exam data intact.

create table if not exists public.pmp_module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (module_id in ('people', 'process', 'business')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table if not exists public.pmp_flashcard_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id text not null,
  last_rating text not null check (last_rating in ('hard', 'medium', 'easy')),
  review_count integer not null default 1 check (review_count > 0),
  last_reviewed_at timestamptz not null default now(),
  due_at timestamptz not null default now(),
  primary key (user_id, flashcard_id)
);

alter table public.pmp_module_progress enable row level security;
alter table public.pmp_flashcard_reviews enable row level security;

drop policy if exists "Learners manage own module progress" on public.pmp_module_progress;
create policy "Learners manage own module progress" on public.pmp_module_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Learners manage own flashcard reviews" on public.pmp_flashcard_reviews;
create policy "Learners manage own flashcard reviews" on public.pmp_flashcard_reviews
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.pmp_get_cloud_learning_progress()
returns table (
  completed_modules text[],
  flashcards_reviewed integer,
  settings jsonb
)
language sql stable security definer set search_path = public as $$
  select
    coalesce((
      select array_agg(module_id order by module_id)
      from public.pmp_module_progress
      where user_id = auth.uid() and completed_at is not null
    ), '{}'::text[]),
    (select count(*)::integer from public.pmp_flashcard_reviews where user_id = auth.uid()),
    coalesce((
      select jsonb_build_object(
        'notifications', notifications,
        'darkMode', dark_mode,
        'studyReminders', study_reminders
      )
      from public.pmp_learner_settings where user_id = auth.uid()
    ), '{"notifications": true, "darkMode": false, "studyReminders": true}'::jsonb);
$$;

revoke all on function public.pmp_get_cloud_learning_progress() from public;
grant execute on function public.pmp_get_cloud_learning_progress() to authenticated;
