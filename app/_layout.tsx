import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { initI18n } from '../lib/i18n';
import {
  registerForPushNotifications,
  savePushToken,
  setupNotificationCategories,
  setupNotificationResponseListener,
} from '../lib/notifications';
import { refreshScheduleIfNeeded } from '../lib/scheduler';
import { useHabitStore } from '../lib/store';

/** Parse key=value pairs from a string segment (handles values containing '='). */
function parseSegment(segment: string): Record<string, string> {
  if (!segment) return {};
  return Object.fromEntries(
    segment.split('&').map((pair) => {
      const idx = pair.indexOf('=');
      if (idx < 0) return [pair, ''];
      return [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
    })
  );
}

/** Parse URL — checks query params first, then hash fragment. */
function parseDeepLinkParams(url: string): Record<string, string> {
  const query = url.split('?')[1]?.split('#')[0];
  if (query) {
    const params = parseSegment(query);
    if (params.access_token) return params;
  }
  const hash = url.split('#')[1];
  return parseSegment(hash ?? '');
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const logHabit = useHabitStore((s) => s.logHabit);
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setupNotificationCategories();
    const subscription = setupNotificationResponseListener((habitId) => {
      logHabit(habitId, 'notification');
    });
    return () => subscription.remove();
  }, []);

  // Init i18n + check onboarding in parallel
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('onboarding_done'),
      initI18n(),
    ]).then(([onboarding]) => {
      setOnboardingDone(onboarding === 'true');
      setReady(true);
    });
  }, []);

  // Stack mount edildikten sonra onboarding yönlendirmesi yap
  useEffect(() => {
    if (!ready || onboardingDone === null) return;
    if (!onboardingDone) {
      router.replace('/onboarding');
    }
  }, [ready, onboardingDone]);

  // Collect deep link URLs — processing is deferred until ready
  useEffect(() => {
    // App opened from cold start via deep link
    Linking.getInitialURL().then((url) => {
      if (url) setPendingUrl(url);
    });

    // App already open, receives deep link
    const sub = Linking.addEventListener('url', ({ url }) => setPendingUrl(url));
    return () => sub.remove();
  }, []);

  // pendingUrl is collected but processed by the reset-password screen via useLocalSearchParams
  useEffect(() => {
    if (!ready || !pendingUrl) return;
    setPendingUrl(null);
  }, [ready, pendingUrl]);

  useEffect(() => {
    if (!ready) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const inAuthGroup = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding';
        const inResetPassword = segments[0] === 'reset-password';
        const inUpdatePassword = segments[1] === 'update-password';

        if (event === 'PASSWORD_RECOVERY') {
          router.replace('/(auth)/update-password');
          return;
        }

        if (session) {
          const token = await registerForPushNotifications();
          if (token) await savePushToken(session.user.id, token);

          const { habits } = useHabitStore.getState();
          if (habits.length === 0) await useHabitStore.getState().fetchHabits();
          refreshScheduleIfNeeded(useHabitStore.getState().habits);

          if ((inAuthGroup && !inUpdatePassword) || inOnboarding) router.replace('/(tabs)');
        } else {
          if (!inAuthGroup && !inOnboarding && !inResetPassword) router.replace('/(auth)/login');
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [segments, ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="habit/new" options={{ presentation: 'modal', headerShown: true, title: t('layout.newHabit') }} />
      <Stack.Screen name="habit/[id]" options={{ presentation: 'modal', headerShown: true, title: t('layout.editHabit') }} />
    </Stack>
  );
}
