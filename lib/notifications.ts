import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('Push token alındı:', token.data);
    return token.data;
  } catch (e) {
    console.warn('Push token alınamadı:', e);
    return null;
  }
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Failed to save push token:', error.message);
  }
}

export function setupNotificationResponseListener(
  onHabitDone: (habitId: string) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const { actionIdentifier, notification } = response;
    const habitId = notification.request.content.data?.habitId as string | undefined;

    if (!habitId) return;

    if (
      actionIdentifier === 'DONE' ||
      actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      onHabitDone(habitId);
    }
    // SNOOZE: re-schedule 15 min from now
    if (actionIdentifier === 'SNOOZE') {
      const snoozeAt = new Date(Date.now() + 15 * 60 * 1000);
      Notifications.scheduleNotificationAsync({
        content: notification.request.content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: snoozeAt },
      });
    }
  });
}

export function setupNotificationCategories(): void {
  Notifications.setNotificationCategoryAsync('HABIT_REMINDER', [
    {
      identifier: 'DONE',
      buttonTitle: 'Yaptım ✓',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'SNOOZE',
      buttonTitle: '15 dk sonra hatırlat',
      options: { opensAppToForeground: false },
    },
  ]);
}
