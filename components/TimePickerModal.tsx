import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  initialTime: string; // "HH:MM"
  onConfirm: (time: string) => void;
  onClose: () => void;
}

const MINUTES = ['00', '15', '30', '45'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimePickerModal({ visible, initialTime, onConfirm, onClose }: Props) {
  const { t } = useTranslation();

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h ?? '9', 10);
    const min = parseInt(m ?? '0', 10);
    const nearestMin = MINUTES.reduce((prev, cur) =>
      Math.abs(parseInt(cur) - min) < Math.abs(parseInt(prev) - min) ? cur : prev
    );
    return { hour: isNaN(hour) ? 9 : hour, minute: nearestMin };
  };

  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState('00');

  useEffect(() => {
    if (visible) {
      const { hour, minute } = parseTime(initialTime);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const time = `${String(selectedHour).padStart(2, '0')}:${selectedMinute}`;
    onConfirm(time);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('timePicker.title')}</Text>

          {/* Hour grid */}
          <Text style={styles.sectionLabel}>{t('timePicker.hour')}</Text>
          <View style={styles.hourGrid}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hourCell, selectedHour === h && styles.selectedCell]}
                onPress={() => setSelectedHour(h)}
              >
                <Text style={[styles.cellText, selectedHour === h && styles.selectedCellText]}>
                  {String(h).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Minute row */}
          <Text style={styles.sectionLabel}>{t('timePicker.minute')}</Text>
          <View style={styles.minuteRow}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.minuteCell, selectedMinute === m && styles.selectedCell]}
                onPress={() => setSelectedMinute(m)}
              >
                <Text style={[styles.cellText, selectedMinute === m && styles.selectedCellText]}>
                  :{m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <Text style={styles.preview}>
            {String(selectedHour).padStart(2, '0')}:{selectedMinute}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>{t('timePicker.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>{t('timePicker.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
    marginTop: 4,
  },
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  hourCell: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
  },
  minuteRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  minuteCell: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
  },
  selectedCell: {
    backgroundColor: '#6C5CE7',
  },
  cellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3C8C',
  },
  selectedCellText: {
    color: '#fff',
  },
  preview: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: '#6C5CE7',
    marginBottom: 20,
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636E72',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
