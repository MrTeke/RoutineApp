import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  habitName: string;
  icon: string | null;
  color: string;
  streak: number;
  totalDone: number;
};

/**
 * Off-screen card that gets captured by react-native-view-shot.
 * Fixed 360×200 size so the PNG is always consistent.
 */
export default function ShareCard({ habitName, icon, color, streak, totalDone }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {/* Background decoration circles */}
      <View style={[styles.circle1, { borderColor: 'rgba(255,255,255,0.15)' }]} />
      <View style={[styles.circle2, { borderColor: 'rgba(255,255,255,0.10)' }]} />

      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.appName}>Lumi</Text>
        <Text style={styles.iconEmoji}>{icon ?? '⭐'}</Text>
      </View>

      {/* Streak number */}
      <View style={styles.streakBlock}>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>{t('shareCard.streak', { count: streak })}</Text>
      </View>

      {/* Habit name */}
      <Text style={styles.habitName} numberOfLines={1}>{habitName}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('shareCard.total', { count: totalDone })}</Text>
        <Text style={styles.footerText}>lumi.app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 200,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  circle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 40,
    top: -80,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 30,
    bottom: -50,
    left: -30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },
  iconEmoji: { fontSize: 28 },
  streakBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  streakNum: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 76,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
});
