-- ─── Feedback table ──────────────────────────────────────────────────────────
create table public.feedback (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  message     text        not null,
  app_version text        not null,
  created_at  timestamptz not null default now()
);

create index feedback_user_id_idx on public.feedback(user_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.feedback enable row level security;

create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);
-- No SELECT policy: feedback is read via Supabase dashboard with service role only.
-- If users ever need to view their own submissions, add:
--   create policy "Users can view own feedback" on public.feedback for select using (auth.uid() = user_id);
