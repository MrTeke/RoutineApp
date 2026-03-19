import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationType = 'interval' | 'fixed' | 'smart';

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  notification_type: NotificationType;
  // interval: minutes between reminders (e.g. 120 = every 2h)
  notification_interval_minutes: number | null;
  // fixed: array of HH:MM strings (e.g. ["09:00","21:00"])
  notification_times: string[] | null;
  // smart: active window start/end in HH:MM
  smart_window_start: string | null;
  smart_window_end: string | null;
  target_per_day: number;
  unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  logged_at: string;
  source: 'manual' | 'notification';
  note: string | null;
};

export type NotificationSchedule = {
  id: string;
  habit_id: string;
  user_id: string;
  scheduled_at: string;
  sent: boolean;
  sent_at: string | null;
};
