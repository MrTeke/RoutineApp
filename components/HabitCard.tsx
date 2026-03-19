import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Habit, HabitLog } from '../lib/supabase';
import { useEffect } from 'react';

type Props = {
  habit: Habit;
  todayLogs: HabitLog[];
  onLog: (habitId: string) => void;
  onPress: () => void;
};

export function HabitCard({ habit, todayLogs, onLog, onPress }: Props) {
  const { t } = useTranslation();
  const logCount = todayLogs.filter((l) => l.habit_id === habit.id).length;
  const progress = Math.min(logCount / habit.target_per_day, 1);
  const isDone = progress >= 1;

  const progressWidth = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const checkOpacity = useSharedValue(isDone ? 1 : 0);
  const badgeScale = useSharedValue(isDone ? 1.1 : 1);

  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, { duration: 400 });
    if (isDone) {
      checkOpacity.value = withTiming(1, { duration: 300 });
      badgeScale.value = withSpring(1.1, { damping: 6, stiffness: 200 });
    } else {
      checkOpacity.value = 0;
      badgeScale.value = withSpring(1);
    }
  }, [progress, isDone]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const handleDone = async () => {
    if (isDone) return;
    buttonScale.value = withSpring(0.92, { damping: 4, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1);
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLog(habit.id);
  };

  const progressText = habit.unit
    ? t('habitCard.progress', { count: logCount, target: habit.target_per_day, unit: habit.unit })
    : t('habitCard.progressNoUnit', { count: logCount, target: habit.target_per_day });

  return (
    <TouchableOpacity style={[styles.card, isDone && styles.cardDone]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Animated.View style={[styles.iconBadge, { backgroundColor: habit.color + '22' }, badgeStyle]}>
          <Text style={styles.icon}>{habit.icon ?? '⭐'}</Text>
        </Animated.View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
          <Text style={styles.count}>{progressText}</Text>
        </View>
        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: isDone ? habit.color : '#F0F0F0' }]}
            onPress={handleDone}
            disabled={isDone}
          >
            {isDone ? (
              <Animated.Text style={[styles.doneText, { color: '#fff' }, checkStyle]}>✓</Animated.Text>
            ) : (
              <Text style={[styles.doneText, { color: '#636E72' }]}>{t('habitCard.done')}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: habit.color },
            progressStyle,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardDone: { opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#2D3436' },
  count: { fontSize: 13, color: '#636E72', marginTop: 2 },
  doneButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doneText: { fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
});
