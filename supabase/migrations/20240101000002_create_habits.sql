create type notification_type as enum ('interval', 'fixed', 'smart');

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  color text not null default '#6C5CE7',
  notification_type notification_type not null default 'fixed',
  notification_interval_minutes integer,   -- for 'interval' type
  notification_times text[],               -- for 'fixed' type, e.g. {"09:00","21:00"}
  smart_window_start text,                 -- for 'smart' type, HH:MM
  smart_window_end text,                   -- for 'smart' type, HH:MM
  target_per_day integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_id_idx on public.habits(user_id);
create index habits_is_active_idx on public.habits(is_active);
