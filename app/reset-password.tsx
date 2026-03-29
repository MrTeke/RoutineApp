import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ResetPasswordRedirect() {
  const router = useRouter();
  const { access_token, refresh_token } = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();

  useEffect(() => {
    if (!access_token) return;

    supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token ?? '',
    }).then(({ error }) => {
      if (error) {
        Alert.alert('Link Expired', 'Please request a new password reset link.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') },
        ]);
      } else {
        router.replace('/(auth)/update-password');
      }
    });
  }, [access_token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
