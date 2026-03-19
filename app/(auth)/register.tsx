import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert(t('common.error'), t('auth.register.errorRequired'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.register.errorPassword'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    setLoading(false);
    if (error) Alert.alert(t('auth.register.errorTitle'), error.message);
    else Alert.alert(t('auth.register.successTitle'), t('auth.register.successMessage'));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#6C5CE7', '#a29bfe']} style={styles.gradientHeader}>
        <Text style={styles.title}>Lumi</Text>
        <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
      </LinearGradient>

      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.formCard}>
        <TextInput
          style={[styles.input, nameFocused && styles.inputFocused]}
          placeholder={t('auth.register.namePlaceholder')}
          value={fullName}
          onChangeText={setFullName}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
        />
        <TextInput
          style={[styles.input, emailFocused && styles.inputFocused]}
          placeholder={t('auth.register.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
        <TextInput
          style={[styles.input, passwordFocused && styles.inputFocused]}
          placeholder={t('auth.register.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t('auth.register.loading') : t('auth.register.button')}</Text>
        </TouchableOpacity>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>{t('auth.register.hasAccount')}</Text>
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
  button: { backgroundColor: '#6C5CE7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6C5CE7', fontSize: 14 },
});
