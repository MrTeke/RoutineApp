import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase, Habit } from './supabase';

const LAST_CHECK_KEY = 'adaptive_last_check';
const MIN_DATA_DAYS = 14;

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function shouldRunToday(): Promise<boolean> {
  const last = await AsyncStorage.getItem(LAST_CHECK_KEY);
  return last !== todayDateString();
}

async function markRunToday(): Promise<void> {
  await AsyncStorage.setItem(LAST_CHECK_KEY, todayDateString());
}

async function fetchLogsForHabit(habitId: string, sinceDate: Date): Promise<string[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('logged_at')
    .eq('habit_id', habitId)
    .gte('logged_at', sinceDate.toISOString());

  if (error || !data) return [];
  return data.map((r: { logged_at: string }) => r.logged_at);
}

function completionRate(loggedAtList: string[], targetPerDay: number, windowDays: number): number {
  const countByDay: Record<string, number> = {};
  for (const ts of loggedAtList) {
    const day = ts.slice(0, 10);
    countByDay[day] = (countByDay[day] ?? 0) + 1;
  }
  const completedDays = Object.values(countByDay).filter((count) => count >= targetPerDay).length;
  return completedDays / windowDays;
}

function habitAgeInDays(habit: Habit): number {
  const created = new Date(habit.created_at);
  return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
}

type Suggestion = {
  habit: Habit;
  kind: 'increase' | 'decrease';
  newTarget: number;
  message: string;
};

async function buildSuggestions(habits: Habit[]): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  const now = new Date();

  for (const habit of habits) {
    if (habitAgeInDays(habit) < MIN_DATA_DAYS) continue;

    const icon = habit.icon ?? '🎯';
    const unit = habit.unit ? ` ${habit.unit}` : '';
    const target = habit.target_per_day;

    // 30 günlük pencere — artırma analizi
    const since30 = new Date(now);
    since30.setDate(since30.getDate() - 30);
    const logs30 = await fetchLogsForHabit(habit.id, since30);
    const rate30 = completionRate(logs30, target, 30);

    if (rate30 >= 0.9) {
      const newTarget = Math.round(target * 1.33);
      suggestions.push({
        habit,
        kind: 'increase',
        newTarget,
        message:
          `${icon} ${habit.name} alışkanlığında 30 gündür harika gidiyorsun! ` +
          `Hedefi ${target}${unit} → ${newTarget}${unit} yapalım mı?`,
      });
      continue;
    }

    // 14 günlük pencere — azaltma analizi
    const since14 = new Date(now);
    since14.setDate(since14.getDate() - 14);
    const logs14 = await fetchLogsForHabit(habit.id, since14);

    const rate14 = completionRate(logs14, target, 14);
    if (rate14 <= 0.4) {
      const newTarget = Math.max(1, Math.round(target * 0.6));
      suggestions.push({
        habit,
        kind: 'decrease',
        newTarget,
        message:
          `${icon} ${habit.name} hedefine ulaşmak zorlaşıyor olabilir. ` +
          `${target}${unit} yerine ${newTarget}${unit} ile devam edelim mi?`,
      });
    }
  }

  return suggestions;
}

function showSuggestionsSequentially(
  suggestions: Suggestion[],
  index: number,
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
): void {
  if (index >= suggestions.length) return;

  const s = suggestions[index];
  const next = () => showSuggestionsSequentially(suggestions, index + 1, updateHabit);

  Alert.alert(
    'Hedef Önerisi',
    s.message,
    [
      {
        text: 'Evet',
        onPress: async () => {
          await updateHabit(s.habit.id, { target_per_day: s.newTarget });
          next();
        },
      },
      {
        text: 'Şimdi Değil',
        style: 'cancel',
        onPress: next,
      },
    ],
    { cancelable: false }
  );
}

export async function runAdaptiveCheck(
  habits: Habit[],
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
): Promise<void> {
  if (habits.length === 0) return;

  const should = await shouldRunToday();
  if (!should) return;

  await markRunToday();

  const suggestions = await buildSuggestions(habits);
  if (suggestions.length === 0) return;

  showSuggestionsSequentially(suggestions, 0, updateHabit);
}
