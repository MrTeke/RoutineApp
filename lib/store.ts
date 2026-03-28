import { create } from 'zustand';
import { supabase, Habit, HabitLog } from './supabase';
import { generateSchedule } from './scheduler';

type HabitStore = {
  habits: Habit[];
  todayLogs: HabitLog[];
  loading: boolean;
  error: string | null;

  fetchHabits: () => Promise<void>;
  fetchTodayLogs: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Habit | null>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (habitId: string, source?: HabitLog['source']) => Promise<void>;
  clearError: () => void;
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  todayLogs: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchHabits: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      set({ error: 'Alışkanlıklar yüklenemedi. Tekrar dene.' });
    } else if (data) {
      set({ habits: data as Habit[] });
    }
    set({ loading: false });
  },

  fetchTodayLogs: async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('logged_at', todayStart.toISOString());

    if (error) {
      set({ error: 'Günlük kayıtlar yüklenemedi. Tekrar dene.' });
    } else if (data) {
      set({ todayLogs: data as HabitLog[] });
    }
  },

  addHabit: async (habitData) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('habits')
      .insert({ ...habitData, user_id: userData.user.id })
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to add habit:', error?.message);
      return null;
    }

    const newHabit = data as Habit;

    // Generate and save notification schedule
    const slots = generateSchedule(newHabit);
    if (slots.length > 0) {
      await supabase.from('notification_schedule').insert(slots);
    }

    set((state) => ({ habits: [...state.habits, newHabit] }));
    return newHabit;
  },

  updateHabit: async (id, updates) => {
    const { error } = await supabase
      .from('habits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      set({ error: 'Alışkanlık güncellenemedi. Tekrar dene.' });
      return;
    }

    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));

    // Regenerate schedule if notification settings changed
    if (
      updates.notification_type ||
      updates.notification_interval_minutes ||
      updates.notification_times ||
      updates.smart_window_start ||
      updates.smart_window_end ||
      updates.target_per_day !== undefined
    ) {
      const habit = get().habits.find((h) => h.id === id);
      if (habit) {
        const updatedHabit = { ...habit, ...updates };
        await supabase
          .from('notification_schedule')
          .delete()
          .eq('habit_id', id)
          .eq('sent', false);
        const slots = generateSchedule(updatedHabit as Habit);
        if (slots.length > 0) {
          await supabase.from('notification_schedule').insert(slots);
        }
      }
    }
  },

  deleteHabit: async (id) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      set({ error: 'Alışkanlık silinemedi. Tekrar dene.' });
      return;
    }

    // Gönderilmemiş bildirimleri temizle
    await supabase
      .from('notification_schedule')
      .delete()
      .eq('habit_id', id)
      .eq('sent', false);

    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
  },

  logHabit: async (habitId, source = 'manual') => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: userData.user.id,
        logged_at: new Date().toISOString(),
        source,
      })
      .select()
      .single();

    if (error) {
      set({ error: 'Alışkanlık kaydedilemedi. Tekrar dene.' });
    } else if (data) {
      set((state) => ({ todayLogs: [...state.todayLogs, data as HabitLog] }));
    }
  },
}));
