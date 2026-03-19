import { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ListRenderItemInfo } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type Slide = { key: string; emoji: string; titleKey: string; subtitleKey: string; colors: [string, string] };

const SLIDES: Slide[] = [
  { key: 'welcome', emoji: '🌟', titleKey: 'onboarding.slides.welcome.title', subtitleKey: 'onboarding.slides.welcome.subtitle', colors: ['#6C5CE7', '#a29bfe'] },
  { key: 'track',   emoji: '📋', titleKey: 'onboarding.slides.track.title',   subtitleKey: 'onboarding.slides.track.subtitle',   colors: ['#00B894', '#55efc4'] },
  { key: 'notify',  emoji: '🔔', titleKey: 'onboarding.slides.notify.title',  subtitleKey: 'onboarding.slides.notify.subtitle',  colors: ['#0984E3', '#74b9ff'] },
  { key: 'streak',  emoji: '🔥', titleKey: 'onboarding.slides.streak.title',  subtitleKey: 'onboarding.slides.streak.subtitle',  colors: ['#E17055', '#fab1a0'] },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/(auth)/register');
  };

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => (
    <LinearGradient colors={item.colors} style={styles.slide}>
      <Animated.Text entering={FadeIn.duration(500)} style={styles.emoji}>{item.emoji}</Animated.Text>
      <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.title}>{t(item.titleKey)}</Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subtitle}>{t(item.subtitleKey)}</Animated.Text>
    </LinearGradient>
  );

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEnabled={false}
        style={styles.list}
      />
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.buttons}>
          {!isLast ? (
            <TouchableOpacity onPress={finish} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipButton} />
          )}
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>{isLast ? t('onboarding.start') : t('onboarding.next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { flex: 1 },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  emoji: { fontSize: 96, marginBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 42, marginBottom: 20 },
  subtitle: { fontSize: 17, color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 26 },
  bottom: { backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 24, paddingBottom: 44, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DFE6E9' },
  dotActive: { width: 24, backgroundColor: '#6C5CE7' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipButton: { paddingVertical: 8, paddingHorizontal: 4, minWidth: 60 },
  skipText: { fontSize: 16, color: '#B2BEC3', fontWeight: '500' },
  nextButton: { backgroundColor: '#6C5CE7', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, minWidth: 120, alignItems: 'center' },
  nextText: { fontSize: 16, color: '#fff', fontWeight: '700' },
});
