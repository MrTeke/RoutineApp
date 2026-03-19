import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../lib/supabase';
import { changeLanguage, SUPPORTED_LANGUAGES, getDateLocale } from '../../lib/i18n';

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [habitCount, setHabitCount] = useState(0);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const [{ data: prof }, { count: habits }, { count: logs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userData.user.id).single(),
      supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id).eq('is_active', true),
      supabase.from('habit_logs').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id),
    ]);

    if (prof) {
      setProfile(prof as Profile);
      setFullName(prof.full_name ?? '');
    }
    setHabitCount(habits ?? 0);
    setLogCount(logs ?? 0);
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    setSaving(false);

    if (error) {
      Alert.alert(t('common.error'), t('profile.saveError'));
    } else {
      setProfile({ ...profile, full_name: fullName.trim() || null });
      setEditing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('profile.signOut.title'), t('profile.signOut.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut.confirm'),
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  const initials = getInitials(profile?.full_name ?? null, profile?.email ?? '?');
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(getDateLocale(), { month: 'long', year: 'numeric' })
    : '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Avatar + Name ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {editing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor="#B2BEC3"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity
                style={[styles.nameActionBtn, styles.nameSaveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSaveName}
                disabled={saving}
              >
                <Text style={styles.nameSaveTxt}>{saving ? '…' : t('common.save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nameActionBtn}
                onPress={() => { setFullName(profile?.full_name ?? ''); setEditing(false); }}
              >
                <Text style={styles.nameCancelTxt}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.nameRow} onPress={() => setEditing(true)}>
              <Text style={styles.displayName}>
                {profile?.full_name ?? t('profile.addName')}
              </Text>
              <Text style={styles.editHint}>✎</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.email}>{profile?.email}</Text>
          <Text style={styles.memberSince}>{t('profile.memberSince', { date: memberSince })}</Text>
        </Animated.View>

        {/* ── Stats ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{habitCount}</Text>
            <Text style={styles.statLabel}>{t('profile.activeHabits')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{logCount}</Text>
            <Text style={styles.statLabel}>{t('profile.totalCompletions')}</Text>
          </View>
        </Animated.View>

        {/* ── Notifications ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Text style={styles.sectionHeader}>{t('profile.sections.notifications')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardRow} onPress={() => Linking.openSettings()}>
              <Text style={styles.cardIcon}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t('profile.notif.title')}</Text>
                <Text style={styles.cardSub}>
                  {profile?.expo_push_token ? t('profile.notif.active') : t('profile.notif.inactive')}
                </Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: profile?.expo_push_token ? '#00B894' : '#E17055' }]} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Language ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={styles.sectionHeader}>{t('profile.sections.language')}</Text>
          <View style={styles.card}>
            {SUPPORTED_LANGUAGES.map((lang, idx) => (
              <View key={lang.code}>
                <TouchableOpacity
                  style={styles.cardRow}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={styles.cardIcon}>{lang.flag}</Text>
                  <Text style={[styles.cardTitle, { flex: 1 }]}>{lang.label}</Text>
                  {i18n.language === lang.code && (
                    <View style={styles.langCheck}>
                      <Text style={styles.langCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {idx < SUPPORTED_LANGUAGES.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Account ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Text style={styles.sectionHeader}>{t('profile.sections.account')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardRow} onPress={handleSignOut}>
              <Text style={styles.cardIcon}>🚪</Text>
              <Text style={[styles.cardTitle, { color: '#D63031' }]}>{t('profile.signOut.button')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Avatar section
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#6C5CE7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#6C5CE7', shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  displayName: { fontSize: 22, fontWeight: '700', color: '#2D3436' },
  editHint: { fontSize: 16, color: '#B2BEC3' },

  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nameInput: {
    flex: 1, fontSize: 18, fontWeight: '600', color: '#2D3436',
    borderBottomWidth: 2, borderBottomColor: '#6C5CE7',
    paddingVertical: 4, textAlign: 'center',
  },
  nameActionBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  nameSaveBtn: { backgroundColor: '#6C5CE7', borderRadius: 8 },
  nameSaveTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  nameCancelTxt: { color: '#636E72', fontWeight: '500', fontSize: 13 },

  email: { fontSize: 14, color: '#636E72', marginBottom: 4 },
  memberSince: { fontSize: 12, color: '#B2BEC3' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#F0F0F0' },
  statNum: { fontSize: 28, fontWeight: '800', color: '#6C5CE7' },
  statLabel: { fontSize: 12, color: '#636E72', marginTop: 2, textAlign: 'center' },

  // Section + card
  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: '#B2BEC3',
    letterSpacing: 0.8, marginTop: 24, marginBottom: 8, marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16 },
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  cardIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  cardSub: { fontSize: 12, color: '#636E72', marginTop: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  chevron: { fontSize: 20, color: '#B2BEC3', marginLeft: 4 },

  // Language
  langCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center',
  },
  langCheckText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
