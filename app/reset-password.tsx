import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

export default function ResetPasswordRedirect() {
  useEffect(() => {
    async function handle() {
      const url = await Linking.getInitialURL();
      if (!url) return;

      // Case 1: implicit flow — tokens in hash fragment
      const hash = url.split('#')[1];
      if (hash) {
        const params = Object.fromEntries(
          hash.split('&').map((pair) => {
            const [k, v] = pair.split('=');
            return [k, decodeURIComponent(v ?? '')];
          })
        );
        if (params.access_token) {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token ?? '',
          });
          // onAuthStateChange in _layout.tsx fires PASSWORD_RECOVERY → navigates to update-password
          return;
        }
      }

      // Case 2: PKCE flow — code in query params
      const search = url.split('?')[1]?.split('#')[0];
      if (search) {
        const params = Object.fromEntries(
          search.split('&').map((pair) => {
            const [k, v] = pair.split('=');
            return [k, decodeURIComponent(v ?? '')];
          })
        );
        if (params.code) {
          await supabase.auth.exchangeCodeForSession(params.code);
          // onAuthStateChange in _layout.tsx fires PASSWORD_RECOVERY → navigates to update-password
        }
      }
    }

    handle();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
