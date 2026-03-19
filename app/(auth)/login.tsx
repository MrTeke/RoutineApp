import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

function getLoginErrorKey(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'auth.login.errorInvalidCredentials';
  }
  if (lower.includes('email not confirmed')) {
    return 'auth.login.errorEmailNotConfirmed';
  }
  return 'auth.login.errorGeneric';
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.login.errorRequired'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert(t('auth.login.errorTitle'), t(getLoginErrorKey(error.message)));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#6C5CE7', '#a29bfe']} style={styles.gradientHeader}>
        <Text style={styles.title}>Lumi</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
      </LinearGradient>

      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.formCard}>
        <TextInput
          style={[styles.input, emailFocused && styles.inputFocused]}
          placeholder={t('auth.login.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
        <TextInput
          style={[styles.input, passwordFocused && styles.inputFocused]}
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>{t('auth.login.forgotPassword')}</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t('auth.login.loading') : t('auth.login.button')}</Text>
        </TouchableOpacity>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>{t('auth.login.noAccount')}</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  gradientHeader: { flex: 0.4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  formCard: {
    flex: 0.6, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32, paddingTop: 36, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 }, elevation: 8,
  },
  input: { backgroundColor: '#F8F7FF', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#E0E0E0' },
  inputFocused: { borderColor: '#6C5CE7' },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 4, paddingVertical: 4 },
  forgotText: { color: '#6C5CE7', fontSize: 13, fontWeight: '500' },
  button: { backgroundColor: '#6C5CE7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6C5CE7', fontSize: 14 },
});
