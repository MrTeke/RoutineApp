import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useHabitStore } from '../../lib/store';
import { runAdaptiveCheck } from '../../lib/adaptive';
import { HabitCard } from '../../components/HabitCard';
import { ProgressRing } from '../../components/ProgressRing';
import { getDateLocale } from '../../lib/i18n';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { habits, todayLogs, loading, fetchHabits, fetchTodayLogs, logHabit, updateHabit, error, clearError } = useHabitStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchHabits(); fetchTodayLogs(); }, []);

  useEffect(() => {
    if (!loading && habits.length > 0) runAdaptiveCheck(habits, updateHabit);
  }, [habits, loading]);

  useEffect(() => {
    if (error) Alert.alert(t('common.error'), error, [{ text: t('common.ok'), onPress: clearError }]);
  }, [error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchHabits(), fetchTodayLogs()]);
    setRefreshing(false);
  }, [fetchHabits, fetchTodayLogs]);

  const today = new Date().toLocaleDateString(getDateLocale(), { weekday: 'long', day: 'numeric', month: 'long' });

  const completedHabits = habits.filter((h) => todayLogs.filter((l) => l.habit_id === h.id).length >= h.target_per_day).length;
  const remainingHabits = habits.length - completedHabits;
  const overallProgress = habits.length > 0 ? completedHabits / habits.length : 0;

  const getMotivation = () => {
    if (habits.length === 0) return t('dashboard.motivation.noHabits');
    if (overallProgress === 0) return t('dashboard.motivation.zero');
    if (overallProgress < 0.5) return t('dashboard.motivation.low');
    if (overallProgress < 1) return t('dashboard.motivation.almost');
    return t('dashboard.motivation.done');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" colors={['#6C5CE7']} />}
    >
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('dashboard.greeting')}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <ProgressRing progress={overallProgress} size={80} strokeWidth={8} label={t('dashboard.today')} />
      </Animated.View>

      {habits.length > 0 && (
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.summaryCard}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryNum}>{completedHabits}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.completed')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryNum}>{remainingHabits}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.remaining')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryNum}>{habits.length}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.total')}</Text>
          </View>
        </Animated.View>
      )}

      {habits.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.motivationRow}>
          <Text style={styles.motivationText}>{getMotivation()}</Text>
        </Animated.View>
      )}

      <View style={styles.section}>
        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.sectionTitle')}</Text>
          <Link href="/habit/new" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>{t('dashboard.addButton')}</Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
          </View>
        ) : habits.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>{t('dashboard.empty.title')}</Text>
            <Text style={styles.emptySubtitle}>{t('dashboard.empty.subtitle')}</Text>
            <Link href="/habit/new" asChild>
              <TouchableOpacity style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>{t('dashboard.empty.button')}</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        ) : (
          habits.map((habit, index) => (
            <Animated.View key={habit.id} entering={FadeInDown.delay(220 + index * 60).springify()}>
              <HabitCard habit={habit} todayLogs={todayLogs} onLog={logHabit} onPress={() => router.push(`/habit/${habit.id}`)} />
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#2D3436' },
  date: { fontSize: 14, color: '#636E72', marginTop: 4 },
  summaryCard: { backgroundColor: '#6C5CE7', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },
  summaryNum: { fontSize: 26, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  motivationRow: { marginBottom: 20 },
  motivationText: { fontSize: 13, color: '#636E72', textAlign: 'center' },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  addButton: { backgroundColor: '#6C5CE7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  loadingContainer: { paddingVertical: 48, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#636E72', marginBottom: 24 },
  emptyButton: { backgroundColor: '#6C5CE7', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
