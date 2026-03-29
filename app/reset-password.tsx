import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ResetPasswordRedirect() {
  const router = useRouter();
  const { access_token, refresh_token, error } = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    error?: string;
  }>();

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Link Expired',
        'The password reset link has expired. Please request a new one.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') }]
      );
      return;
    }

    if (access_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token ?? '',
      }).then(() => {
        router.replace('/(auth)/update-password');
      });
    }
  }, [access_token, error]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
