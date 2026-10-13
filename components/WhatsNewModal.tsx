import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import type { Feedback } from '../lib/supabase';

interface Props {
  visible: boolean;
  userId: string;
  onDismiss: () => void;
}

export default function WhatsNewModal({ visible, userId, onDismiss }: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.1.0';

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSending(true);
    const payload: Omit<Feedback, 'id' | 'created_at'> = {
      user_id: userId,
      message: trimmed,
      app_version: appVersion,
    };
    await supabase.from('feedback').insert(payload);
    setSending(false);
    setSent(true);
  };

  const handleClose = () => {
    setMessage('');
    setSent(false);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          {sent ? (
            <View style={styles.thankYouContainer}>
              <Text style={styles.thankYouEmoji}>🎉</Text>
              <Text style={styles.thankYouTitle}>{t('whatsNew.thankYou')}</Text>
              <Text style={styles.thankYouSub}>{t('whatsNew.thankYouSub')}</Text>
              <TouchableOpacity style={styles.confirmButton} onPress={handleClose}>
                <Text style={styles.confirmText}>{t('common.ok')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <LinearGradient
                colors={['#A29BFE', '#6C5CE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <Text style={styles.version}>v{appVersion}</Text>
                <Text style={styles.title}>{t('whatsNew.title')}</Text>
                <Text style={styles.subtitle}>{t('whatsNew.subtitle')}</Text>
              </LinearGradient>

              <View style={styles.formSection}>
                <Text style={styles.question}>{t('whatsNew.question')}</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={t('whatsNew.placeholder')}
                  placeholderTextColor="#B2BEC3"
                  textAlignVertical="top"
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleClose}
                    disabled={sending}
                  >
                    <Text style={styles.skipText}>{t('whatsNew.skip')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!message.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim() || sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.sendText}>{t('whatsNew.send')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  version: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  formSection: {
    padding: 24,
    paddingBottom: 40,
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0DEFF',
    padding: 14,
    fontSize: 15,
    color: '#2D3436',
    minHeight: 110,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636E72',
  },
  sendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  thankYouContainer: {
    alignItems: 'center',
    padding: 36,
    paddingBottom: 48,
  },
  thankYouEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 10,
  },
  thankYouSub: {
    fontSize: 15,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
