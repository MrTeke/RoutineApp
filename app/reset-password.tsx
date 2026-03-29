import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

function parseQuery(url: string): Record<string, string> {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  if (!query) return {};
  return Object.fromEntries(
    query.split('&').map((pair) => {
      const idx = pair.indexOf('=');
      if (idx < 0) return [pair, ''];
      return [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
    })
  );
}

export default function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();

  useEffect(() => {
    let cancelled = false;

    async function handle() {
      // Try 1: useLocalSearchParams (may be empty on cold start)
      let accessToken = searchParams.access_token;
      let refreshToken = searchParams.refresh_token ?? '';

      // Try 2: getInitialURL fallback
      if (!accessToken) {
        const url = await Linking.getInitialURL();
        if (url) {
          const params = parseQuery(url);
          accessToken = params.access_token;
          refreshToken = params.refresh_token ?? '';
        }
      }

      if (cancelled) return;

      if (!accessToken) {
        // No token found — send back to forgot-password
        Alert.alert('Link Expired', 'Please request a new password reset link.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') },
        ]);
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (cancelled) return;

      if (error) {
        Alert.alert('Link Expired', 'Please request a new password reset link.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') },
        ]);
      } else {
        router.replace('/(auth)/update-password');
      }
    }

    handle();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
