import { supabase, Habit } from './supabase';

export type ScheduleSlot = {
  habit_id: string;
  user_id: string;
  scheduled_at: string; // ISO string
};

/**
 * Generate notification schedule slots for the next `days` days
 * based on the habit's notification_type.
 */
export function generateSchedule(habit: Habit, days = 30): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() + d);
    dayStart.setHours(0, 0, 0, 0);

    if (habit.notification_type === 'interval') {
      slots.push(...generateIntervalSlots(habit, dayStart));
    } else if (habit.notification_type === 'fixed') {
      slots.push(...generateFixedSlots(habit, dayStart));
    } else if (habit.notification_type === 'smart') {
      slots.push(...generateSmartSlots(habit, dayStart));
    }
  }

  // Filter out past slots
  return slots.filter((s) => new Date(s.scheduled_at) > now);
}

function generateIntervalSlots(habit: Habit, dayStart: Date): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const intervalMs = (habit.notification_interval_minutes ?? 120) * 60 * 1000;
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(22, 0, 0, 0);

  // Start from 8:00
  const cursor = new Date(dayStart);
  cursor.setHours(8, 0, 0, 0);

  while (cursor <= dayEnd) {
    slots.push({
      habit_id: habit.id,
      user_id: habit.user_id,
      scheduled_at: new Date(cursor).toISOString(),
    });
    cursor.setTime(cursor.getTime() + intervalMs);
  }

  return slots;
}

function generateFixedSlots(habit: Habit, dayStart: Date): ScheduleSlot[] {
  if (!habit.notification_times?.length) return [];

  return habit.notification_times.map((timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const slotDate = new Date(dayStart);
    slotDate.setHours(hours, minutes, 0, 0);
    return {
      habit_id: habit.id,
      user_id: habit.user_id,
      scheduled_at: slotDate.toISOString(),
    };
  });
}

/**
 * For each active habit, if there are no unsent slots in the next 24 hours,
 * generate a fresh 7-day schedule and upsert it into notification_schedule.
 * Safe to call on every app open — skips habits that already have upcoming slots.
 */
export async function refreshScheduleIfNeeded(habits: Habit[]): Promise<void> {
  if (habits.length === 0) return;

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Fetch all unsent slots for these habits in the next 24h
  const habitIds = habits.map((h) => h.id);
  const { data: upcoming } = await supabase
    .from('notification_schedule')
    .select('habit_id')
    .in('habit_id', habitIds)
    .eq('sent', false)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', in24h.toISOString());

  const coveredHabitIds = new Set((upcoming ?? []).map((r: { habit_id: string }) => r.habit_id));

  const habitsNeedingRefresh = habits.filter((h) => !coveredHabitIds.has(h.id));
  if (habitsNeedingRefresh.length === 0) return;

  const newSlots = habitsNeedingRefresh.flatMap((h) => generateSchedule(h, 30));
  if (newSlots.length === 0) return;

  await supabase.from('notification_schedule').insert(newSlots);
  console.log(`Schedule refreshed: ${newSlots.length} slots for ${habitsNeedingRefresh.length} habit(s)`);
}

function generateSmartSlots(habit: Habit, dayStart: Date): ScheduleSlot[] {
  // Smart: evenly distribute `target_per_day` notifications within the active window
  const [startH, startM] = (habit.smart_window_start ?? '09:00').split(':').map(Number);
  const [endH, endM] = (habit.smart_window_end ?? '21:00').split(':').map(Number);

  const windowStart = new Date(dayStart);
  windowStart.setHours(startH, startM, 0, 0);
  const windowEnd = new Date(dayStart);
  windowEnd.setHours(endH, endM, 0, 0);

  const windowMs = windowEnd.getTime() - windowStart.getTime();
  const count = habit.target_per_day || 3;
  const stepMs = windowMs / count;

  return Array.from({ length: count }, (_, i) => ({
    habit_id: habit.id,
    user_id: habit.user_id,
    scheduled_at: new Date(windowStart.getTime() + stepMs * i + stepMs / 2).toISOString(),
  }));
}
