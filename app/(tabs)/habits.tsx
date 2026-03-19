import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useHabitStore } from '../../lib/store';
import { HabitCard } from '../../components/HabitCard';

export default function HabitsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { habits, todayLogs, loading, fetchHabits, fetchTodayLogs, logHabit, error, clearError } = useHabitStore();

  useEffect(() => { fetchHabits(); fetchTodayLogs(); }, []);

  useEffect(() => {
    if (error) Alert.alert(t('common.error'), error, [{ text: t('common.ok'), onPress: clearError }]);
  }, [error]);

  if (loading && habits.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#6C5CE7" /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>{t('habits.empty.title')}</Text>
            <Text style={styles.emptySubtitle}>{t('habits.empty.subtitle')}</Text>
          </View>
        ) : (
          habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} todayLogs={todayLogs} onLog={logHabit} onPress={() => router.push(`/habit/${habit.id}`)} />
          ))
        )}
      </ScrollView>
      <Link href="/habit/new" asChild>
        <TouchableOpacity style={styles.fab}><Text style={styles.fabText}>+</Text></TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#636E72' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6C5CE7', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
