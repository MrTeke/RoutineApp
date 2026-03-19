create type log_source as enum ('manual', 'notification');

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  source log_source not null default 'manual',
  note text
);

create index habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index habit_logs_user_id_idx on public.habit_logs(user_id);
create index habit_logs_logged_at_idx on public.habit_logs(logged_at desc);
