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

/** Parse URL fragment (#key=val&key2=val2) into a plain object. */
function parseHashParams(url: string): Record<string, string> {
  const hash = url.split('#')[1];
  if (!hash) return {};
  return Object.fromEntries(
    hash.split('&').map((pair) => {
      const [k, v] = pair.split('=');
      return [k, decodeURIComponent(v ?? '')];
    })
  );
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const logHabit = useHabitStore((s) => s.logHabit);
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
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

  // Handle deep links for password recovery
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const params = parseHashParams(url);
      if (params.type === 'recovery' && params.access_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token ?? '',
        });
        // onAuthStateChange will fire PASSWORD_RECOVERY and navigate
      }
    };

    // App opened from cold start via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // App already open, receives deep link
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const inAuthGroup = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding';

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

          if (inAuthGroup || inOnboarding) router.replace('/(tabs)');
        } else {
          if (!inAuthGroup && !inOnboarding) router.replace('/(auth)/login');
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
