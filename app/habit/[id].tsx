import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useHabitStore } from '../../lib/store';
import { NotificationType } from '../../lib/supabase';
import TimePickerModal from '../../components/TimePickerModal';

const COLORS = ['#6C5CE7', '#00B894', '#E17055', '#FDCB6E', '#0984E3', '#D63031', '#00CEC9'];
const ICONS = ['⭐', '💪', '📚', '🧘', '🏃', '💧', '🍎', '😴', '✍️', '🎯'];

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const habit = habits.find((h) => h.id === id);

  const NOTIF_OPTIONS: { type: NotificationType; label: string; desc: string; icon: string }[] = [
    { type: 'fixed', label: t('habitForm.notif.fixed.label'), desc: t('habitForm.notif.fixed.desc'), icon: '🔔' },
    { type: 'interval', label: t('habitForm.notif.interval.label'), desc: t('habitForm.notif.interval.desc'), icon: '⏱️' },
    { type: 'smart', label: t('habitForm.notif.smart.label'), desc: t('habitForm.notif.smart.desc'), icon: '🧠' },
  ];

  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [icon, setIcon] = useState(habit?.icon ?? '⭐');
  const [color, setColor] = useState(habit?.color ?? '#6C5CE7');
  const [targetPerDay, setTargetPerDay] = useState(String(habit?.target_per_day ?? '1'));
  const [unit, setUnit] = useState(habit?.unit ?? '');
  const [notifType, setNotifType] = useState<NotificationType>(habit?.notification_type ?? 'fixed');
  const [intervalMinutes, setIntervalMinutes] = useState(String(habit?.notification_interval_minutes ?? '120'));
  const [fixedTimes, setFixedTimes] = useState<string[]>(habit?.notification_times ?? ['09:00', '21:00']);
  const [smartStart, setSmartStart] = useState(habit?.smart_window_start ?? '09:00');
  const [smartEnd, setSmartEnd] = useState(habit?.smart_window_end ?? '21:00');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'fixed' | 'start' | 'end'>('fixed');
  const [pickerInitial, setPickerInitial] = useState('09:00');

  useEffect(() => {
    if (!habit) router.back();
  }, [habit]);

  const openPicker = (target: 'fixed' | 'start' | 'end', initial: string) => {
    setPickerTarget(target);
    setPickerInitial(initial);
    setPickerVisible(true);
  };

  const handlePickerConfirm = (time: string) => {
    setPickerVisible(false);
    if (pickerTarget === 'fixed') {
      if (!fixedTimes.includes(time)) setFixedTimes([...fixedTimes, time]);
    } else if (pickerTarget === 'start') {
      setSmartStart(time);
    } else {
      setSmartEnd(time);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('habitForm.errors.nameRequired'));
      return;
    }
    if (notifType === 'fixed' && fixedTimes.length === 0) {
      Alert.alert(t('common.error'), t('habitForm.errors.timeRequired'));
      return;
    }
    setSaving(true);
    await updateHabit(id!, {
      name: name.trim(),
      description: description.trim() || null,
      icon,
      color,
      target_per_day: parseInt(targetPerDay) || 1,
      unit: unit.trim() || null,
      notification_type: notifType,
      notification_interval_minutes: notifType === 'interval' ? parseInt(intervalMinutes) : null,
      notification_times: notifType === 'fixed' ? fixedTimes : null,
      smart_window_start: notifType === 'smart' ? smartStart : null,
      smart_window_end: notifType === 'smart' ? smartEnd : null,
    });
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      t('habitForm.deleteTitle'),
      t('habitForm.deleteMessage', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('habitForm.deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(id!);
            router.back();
          },
        },
      ]
    );
  };

  if (!habit) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Basic Info ─────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('habitForm.sections.basic')}</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('habitForm.nameLabel')}</Text>
          <TextInput
            style={[styles.input, focused === 'name' && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            returnKeyType="next"
          />
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>
            {t('habitForm.descLabel')} <Text style={styles.optional}>{t('common.optional')}</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textarea, focused === 'desc' && styles.inputFocused]}
            placeholder={t('habitForm.descPlaceholder')}
            placeholderTextColor="#B2BEC3"
            value={description}
            onChangeText={setDescription}
            multiline
            onFocus={() => setFocused('desc')}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* ── Appearance ────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('habitForm.sections.appearance')}</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('habitForm.iconLabel')}</Text>
          <View style={styles.iconsRow}>
            {ICONS.map((i) => (
              <TouchableOpacity
                key={i}
                style={[styles.iconOption, icon === i && { borderColor: color, backgroundColor: color + '18' }]}
                onPress={() => setIcon(i)}
              >
                <Text style={styles.iconText}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>{t('habitForm.colorLabel')}</Text>
          <View style={styles.colorsRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }]}
                onPress={() => setColor(c)}
              >
                {color === c && <View style={styles.colorCheck} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Target ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('habitForm.sections.target')}</Text>
        <View style={styles.card}>
          <View style={styles.targetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('habitForm.targetLabel')}</Text>
              <TextInput
                style={[styles.input, focused === 'target' && styles.inputFocused]}
                value={targetPerDay}
                onChangeText={setTargetPerDay}
                keyboardType="number-pad"
                onFocus={() => setFocused('target')}
                onBlur={() => setFocused(null)}
              />
            </View>
            <View style={styles.targetSep} />
            <View style={{ flex: 2 }}>
              <Text style={styles.fieldLabel}>
                {t('habitForm.unitLabel')} <Text style={styles.optional}>{t('common.optional')}</Text>
              </Text>
              <TextInput
                style={[styles.input, focused === 'unit' && styles.inputFocused]}
                placeholder={t('habitForm.unitPlaceholder')}
                placeholderTextColor="#B2BEC3"
                value={unit}
                onChangeText={setUnit}
                onFocus={() => setFocused('unit')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>
        </View>

        {/* ── Notifications ───────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('habitForm.sections.notifications')}</Text>
        <View style={styles.card}>
          {NOTIF_OPTIONS.map((opt, idx) => (
            <View key={opt.type}>
              <TouchableOpacity
                style={styles.notifOption}
                onPress={() => setNotifType(opt.type)}
                activeOpacity={0.7}
              >
                <Text style={styles.notifIcon}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifLabel, notifType === opt.type && { color: '#6C5CE7' }]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.notifDesc}>{opt.desc}</Text>
                </View>
                <View style={[styles.radio, notifType === opt.type && styles.radioActive]}>
                  {notifType === opt.type && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
              {idx < NOTIF_OPTIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          {notifType === 'interval' && (
            <View style={styles.notifExtra}>
              <Text style={styles.fieldLabel}>{t('habitForm.intervalLabel')}</Text>
              <TextInput
                style={[styles.input, focused === 'interval' && styles.inputFocused]}
                value={intervalMinutes}
                onChangeText={setIntervalMinutes}
                keyboardType="number-pad"
                placeholder={t('habitForm.intervalPlaceholder')}
                placeholderTextColor="#B2BEC3"
                onFocus={() => setFocused('interval')}
                onBlur={() => setFocused(null)}
              />
            </View>
          )}

          {notifType === 'fixed' && (
            <View style={styles.notifExtra}>
              <Text style={styles.fieldLabel}>{t('habitForm.timesLabel')}</Text>
              <View style={styles.chips}>
                {fixedTimes.map((time) => (
                  <View key={time} style={styles.chip}>
                    <Text style={styles.chipText}>{time}</Text>
                    <TouchableOpacity onPress={() => setFixedTimes(fixedTimes.filter((x) => x !== time))}>
                      <Text style={styles.chipX}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addChip} onPress={() => openPicker('fixed', '09:00')}>
                  <Text style={styles.addChipText}>{t('habitForm.addTime')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {notifType === 'smart' && (
            <View style={styles.notifExtra}>
              <Text style={styles.fieldLabel}>{t('habitForm.windowLabel')}</Text>
              <View style={styles.smartRow}>
                <TouchableOpacity
                  style={[styles.timeBtn, { flex: 1 }]}
                  onPress={() => openPicker('start', smartStart)}
                >
                  <Text style={styles.timeBtnLabel}>{t('habitForm.windowStart')}</Text>
                  <Text style={styles.timeBtnValue}>{smartStart}</Text>
                </TouchableOpacity>
                <Text style={styles.smartArrow}>→</Text>
                <TouchableOpacity
                  style={[styles.timeBtn, { flex: 1 }]}
                  onPress={() => openPicker('end', smartEnd)}
                >
                  <Text style={styles.timeBtnLabel}>{t('habitForm.windowEnd')}</Text>
                  <Text style={styles.timeBtnValue}>{smartEnd}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? t('habitForm.saving') : t('habitForm.saveEdit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>{t('habitForm.deleteButton')}</Text>
        </TouchableOpacity>

        <TimePickerModal
          visible={pickerVisible}
          initialTime={pickerInitial}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { padding: 20, paddingBottom: 60 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B2BEC3',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 2 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#636E72', marginTop: 12, marginBottom: 6 },
  optional: { fontWeight: '400', color: '#B2BEC3' },

  input: {
    backgroundColor: '#F8F7FF',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#2D3436',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  inputFocused: { borderColor: '#6C5CE7', backgroundColor: '#fff' },
  textarea: { height: 80, textAlignVertical: 'top' },

  iconsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  iconOption: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  iconText: { fontSize: 22 },
  colorsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center' },
  colorDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  colorCheck: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },

  targetRow: { flexDirection: 'row', alignItems: 'flex-start' },
  targetSep: { width: 12 },

  notifOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  notifIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  notifLabel: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  notifDesc: { fontSize: 12, color: '#B2BEC3', marginTop: 1 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#DFE6E9',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#6C5CE7' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6C5CE7' },

  notifExtra: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 4, marginTop: 4 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6C5CE7', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 12,
  },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  chipX: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  addChip: {
    borderWidth: 1.5, borderColor: '#6C5CE7', borderStyle: 'dashed',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14,
  },
  addChipText: { color: '#6C5CE7', fontSize: 13, fontWeight: '600' },

  smartRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  smartArrow: { fontSize: 18, color: '#B2BEC3' },
  timeBtn: {
    backgroundColor: '#F0EEFF', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center',
  },
  timeBtnLabel: { fontSize: 11, color: '#6C5CE7', fontWeight: '600', marginBottom: 2 },
  timeBtnValue: { fontSize: 17, fontWeight: '700', color: '#6C5CE7' },

  saveBtn: { backgroundColor: '#6C5CE7', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: '#D63031',
  },
  deleteBtnText: { color: '#D63031', fontSize: 16, fontWeight: '600' },
});
