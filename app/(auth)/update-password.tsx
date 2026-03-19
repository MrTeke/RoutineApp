import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

export default function UpdatePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleUpdate = async () => {
    if (password.length < 6) {
      Alert.alert(t('auth.updatePassword.errorTitle'), t('auth.updatePassword.errorMinLength'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('auth.updatePassword.errorTitle'), t('auth.updatePassword.errorMatch'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.updatePassword.errorTitle'), t('auth.updatePassword.errorGeneric'));
    } else {
      Alert.alert(
        t('auth.updatePassword.successTitle'),
        t('auth.updatePassword.successMessage'),
        [{
          text: t('common.ok'),
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          },
        }]
      );
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#6C5CE7', '#a29bfe']} style={styles.gradientHeader}>
        <Text style={styles.title}>Lumi</Text>
        <Text style={styles.subtitle}>{t('auth.updatePassword.title')}</Text>
      </LinearGradient>

      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.formCard}>
        <Text style={styles.hint}>{t('auth.updatePassword.subtitle')}</Text>

        <Text style={styles.label}>{t('auth.updatePassword.newPassword')}</Text>
        <TextInput
          style={[styles.input, passwordFocused && styles.inputFocused]}
          placeholder={t('auth.updatePassword.placeholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          returnKeyType="next"
        />

        <Text style={styles.label}>{t('auth.updatePassword.confirmPassword')}</Text>
        <TextInput
          style={[styles.input, confirmFocused && styles.inputFocused]}
          placeholder={t('auth.updatePassword.placeholder')}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          onFocus={() => setConfirmFocused(true)}
          onBlur={() => setConfirmFocused(false)}
          returnKeyType="done"
          onSubmitEditing={handleUpdate}
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? t('auth.updatePassword.loading') : t('auth.updatePassword.button')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  gradientHeader: { flex: 0.35, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  formCard: {
    flex: 0.65, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32, paddingTop: 36, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 }, elevation: 8,
  },
  hint: { fontSize: 14, color: '#636E72', marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#636E72', marginBottom: 6 },
  input: { backgroundColor: '#F8F7FF', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#E0E0E0' },
  inputFocused: { borderColor: '#6C5CE7' },
  button: { backgroundColor: '#6C5CE7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
