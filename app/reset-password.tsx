import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

function parseQueryParams(url: string): Record<string, string> {
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
  const searchParams = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    error?: string;
  }>();

  useEffect(() => {
    async function handle() {
      // Primary: read from expo-router params
      let accessToken = searchParams.access_token;
      let refreshToken = searchParams.refresh_token ?? '';
      let error = searchParams.error;

      // Fallback: parse raw URL if expo-router params are empty
      if (!accessToken && !error) {
        const url = await Linking.getInitialURL();
        if (url) {
          const params = parseQueryParams(url);
          accessToken = params.access_token;
          refreshToken = params.refresh_token ?? '';
          error = params.error;
        }
      }

      if (error) {
        Alert.alert(
          'Link Expired',
          'The password reset link has expired. Please request a new one.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') }]
        );
        return;
      }

      if (accessToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        router.replace('/(auth)/update-password');
      }
    }

    handle();
  }, [searchParams.access_token, searchParams.error]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
