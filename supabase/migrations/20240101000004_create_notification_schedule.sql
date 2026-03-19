create table public.notification_schedule (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  sent boolean not null default false,
  sent_at timestamptz
);

create index notif_schedule_user_idx on public.notification_schedule(user_id);
create index notif_schedule_scheduled_at_idx on public.notification_schedule(scheduled_at);
create index notif_schedule_sent_idx on public.notification_schedule(sent);
