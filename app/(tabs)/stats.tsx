import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useHabitStore } from '../../lib/store';
import { HabitLog } from '../../lib/supabase';
import ShareCard from '../../components/ShareCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const SCREEN_PADDING = 20;
const CELL_GAP = 3;
const CELL_SIZE = Math.floor(
  (SCREEN_WIDTH - SCREEN_PADDING * 2 - CARD_PADDING * 2 - CELL_GAP * 6) / 7
);

type CellStatus = 'done' | 'missed' | 'future' | 'today_done' | 'today_missed';

type CalendarCell = {
  dateStr: string;
  status: CellStatus;
};

type StreakInfo = {
  habitId: string;
  habitName: string;
  icon: string | null;
  color: string;
  streak: number;
  totalDone: number;
  calendar: CalendarCell[]; // 35 cells, Monday-aligned
};

export default function StatsScreen() {
  const { t } = useTranslation();
  const { habits } = useHabitStore();
  const [streaks, setStreaks] = useState<StreakInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const shotRefs = useRef<Record<string, ViewShot | null>>({});

  const colLabels = t('stats.dayLabels', { returnObjects: true }) as string[];

  useEffect(() => {
    loadStats();
  }, [habits]);

  const loadStats = async () => {
    if (habits.length === 0) {
      setLoading(false);
      return;
    }

    const since = new Date();
    since.setDate(since.getDate() - 40);

    const { data: logs } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: false });

    if (logs) {
      const data = habits.map((habit) => {
        const habitLogs = logs.filter((l: HabitLog) => l.habit_id === habit.id);
        return {
          habitId: habit.id,
          habitName: habit.name,
          icon: habit.icon,
          color: habit.color,
          streak: calculateStreak(habitLogs, habit.target_per_day),
          totalDone: countDonedays(habitLogs, habit.target_per_day),
          calendar: buildCalendar(habitLogs, habit.target_per_day),
        };
      });
      setStreaks(data);
    }
    setLoading(false);
  };

  const handleShare = async (s: StreakInfo) => {
    const ref = shotRefs.current[s.habitId];
    if (!ref) return;
    setSharingId(s.habitId);
    try {
      const uri = await (ref as any).capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('stats.shareDialogTitle') });
      } else {
        Alert.alert(t('common.error'), t('stats.shareError.unavailable'));
      }
    } catch {
      Alert.alert(t('common.error'), t('stats.shareError.failed'));
    } finally {
      setSharingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t('stats.title')}</Text>

      {streaks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>{t('stats.empty.title')}</Text>
          <Text style={styles.emptySubtitle}>{t('stats.empty.subtitle')}</Text>
        </View>
      ) : (
        streaks.map((s, index) => (
          <Animated.View
            key={s.habitId}
            entering={FadeInDown.delay(index * 70).springify()}
            style={styles.card}
          >
            {/* Off-screen capture target */}
            <ViewShot
              ref={(r) => { shotRefs.current[s.habitId] = r; }}
              options={{ format: 'png', quality: 1 }}
              style={styles.offscreen}
            >
              <ShareCard
                habitName={s.habitName}
                icon={s.icon}
                color={s.color}
                streak={s.streak}
                totalDone={s.totalDone}
              />
            </ViewShot>

            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={[styles.iconBadge, { backgroundColor: s.color + '33' }]}>
                <Text style={styles.iconText}>{s.icon ?? '⭐'}</Text>
              </View>
              <View style={styles.nameBlock}>
                <View style={styles.nameRow}>
                  <Text style={styles.habitName}>{s.habitName}</Text>
                  {s.streak >= 7 && <Text style={styles.fireBadge}>🔥</Text>}
                </View>
                <Text style={styles.habitSub}>
                  {s.streak === 0
                    ? t('stats.streakDays', { count: s.totalDone })
                    : t('stats.streakSeries', { streak: s.streak, total: s.totalDone })}
                </Text>
              </View>
              <View style={[styles.streakBadge, { backgroundColor: s.color }]}>
                <Text style={styles.streakNum}>{s.streak}</Text>
                <Text style={styles.streakLbl}>{t('stats.streakUnit')}</Text>
              </View>
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarSection}>
              {/* Column headers */}
              <View style={styles.colHeaders}>
                {colLabels.map((lbl) => (
                  <Text key={lbl} style={[styles.colLabel, { width: CELL_SIZE }]}>
                    {lbl}
                  </Text>
                ))}
              </View>

              {/* 5 week rows */}
              {[0, 1, 2, 3, 4].map((week) => (
                <View key={week} style={styles.weekRow}>
                  {s.calendar.slice(week * 7, week * 7 + 7).map((cell, di) => (
                    <CalendarCell
                      key={di}
                      cell={cell}
                      color={s.color}
                      size={CELL_SIZE}
                    />
                  ))}
                </View>
              ))}
            </View>

            {/* Share button */}
            {s.streak > 0 && (
              <TouchableOpacity
                style={[styles.shareBtn, sharingId === s.habitId && { opacity: 0.6 }]}
                onPress={() => handleShare(s)}
                disabled={sharingId === s.habitId}
              >
                <Text style={styles.shareBtnText}>
                  {sharingId === s.habitId ? t('stats.sharing') : t('stats.shareButton')}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

function CalendarCell({ cell, color, size }: { cell: CalendarCell; color: string; size: number }) {
  const isToday = cell.status === 'today_done' || cell.status === 'today_missed';
  const isDone = cell.status === 'done' || cell.status === 'today_done';
  const isFuture = cell.status === 'future';

  return (
    <View
      style={[
        styles.cell,
        { width: size, height: size, borderRadius: size * 0.22 },
        isDone && { backgroundColor: color },
        !isDone && !isFuture && styles.cellMissed,
        isFuture && styles.cellFuture,
        isToday && styles.cellToday,
        isToday && { borderColor: color },
      ]}
    />
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function calculateStreak(logs: HabitLog[], target: number): number {
  const today = new Date();
  let streak = 0;
  for (let d = 0; d < 40; d++) {
    const day = new Date(today);
    day.setDate(day.getDate() - d);
    const dayStr = day.toISOString().split('T')[0];
    if (logs.filter((l) => l.logged_at.startsWith(dayStr)).length >= target) streak++;
    else break;
  }
  return streak;
}

function countDonedays(logs: HabitLog[], target: number): number {
  const days = new Set(logs.map((l) => l.logged_at.split('T')[0]));
  let count = 0;
  days.forEach((day) => {
    if (logs.filter((l) => l.logged_at.startsWith(day)).length >= target) count++;
  });
  return count;
}

function buildCalendar(logs: HabitLog[], target: number): CalendarCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const anchor = new Date(today);
  anchor.setDate(today.getDate() - 28);
  const dow = anchor.getDay();
  anchor.setDate(anchor.getDate() - (dow === 0 ? 6 : dow - 1));

  const cells: CalendarCell[] = [];
  const cursor = new Date(anchor);

  for (let i = 0; i < 35; i++) {
    const dateStr = cursor.toISOString().split('T')[0];
    const done = logs.filter((l) => l.logged_at.startsWith(dateStr)).length >= target;

    let status: CellStatus;
    if (cursor > today) {
      status = 'future';
    } else if (dateStr === todayStr) {
      status = done ? 'today_done' : 'today_missed';
    } else {
      status = done ? 'done' : 'missed';
    }

    cells.push({ dateStr, status });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { padding: SCREEN_PADDING, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#2D3436', marginBottom: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22 },
  nameBlock: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  habitName: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  fireBadge: { fontSize: 14 },
  habitSub: { fontSize: 12, color: '#636E72', marginTop: 2 },
  streakBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  streakNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  streakLbl: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: -1 },

  // Calendar
  calendarSection: { gap: CELL_GAP },
  colHeaders: { flexDirection: 'row', gap: CELL_GAP, marginBottom: 2 },
  colLabel: { fontSize: 9, color: '#B2BEC3', fontWeight: '600', textAlign: 'center' },
  weekRow: { flexDirection: 'row', gap: CELL_GAP },
  cell: { },
  cellMissed: { backgroundColor: '#F0F0F0' },
  cellFuture: { backgroundColor: 'transparent' },
  cellToday: { borderWidth: 2, backgroundColor: 'transparent' },

  // Share
  offscreen: { position: 'absolute', top: -9999, left: -9999 },
  shareBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
  },
  shareBtnText: { fontSize: 14, fontWeight: '700', color: '#6C5CE7' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#636E72', textAlign: 'center' },
});
