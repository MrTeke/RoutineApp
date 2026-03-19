-- ─── Enable RLS ──────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.notification_schedule enable row level security;

-- ─── Profiles ────────────────────────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── Habits ──────────────────────────────────────────────────────────────────
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- ─── Habit Logs ──────────────────────────────────────────────────────────────
create policy "Users can view own logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

-- ─── Notification Schedule ───────────────────────────────────────────────────
create policy "Users can view own schedule"
  on public.notification_schedule for select
  using (auth.uid() = user_id);

create policy "Users can insert own schedule"
  on public.notification_schedule for insert
  with check (auth.uid() = user_id);

create policy "Users can update own schedule"
  on public.notification_schedule for update
  using (auth.uid() = user_id);

create policy "Users can delete own schedule"
  on public.notification_schedule for delete
  using (auth.uid() = user_id);
