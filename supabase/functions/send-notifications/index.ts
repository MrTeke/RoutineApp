import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

interface NotificationRow {
  id: string;
  habit_id: string;
  user_id: string;
  scheduled_at: string;
}

interface HabitRow {
  id: string;
  name: string;
  icon: string | null;
}

interface ProfileRow {
  id: string;
  expo_push_token: string | null;
}

Deno.serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000); // past hour

    // Fetch unsent notifications due in the past hour
    const { data: pendingNotifs, error: fetchError } = await supabase
      .from('notification_schedule')
      .select('id, habit_id, user_id, scheduled_at')
      .eq('sent', false)
      .gte('scheduled_at', windowStart.toISOString())
      .lte('scheduled_at', now.toISOString())
      .limit(500);

    if (fetchError) throw fetchError;
    if (!pendingNotifs || pendingNotifs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Fetch habits and profiles in bulk
    const habitIds = [...new Set((pendingNotifs as NotificationRow[]).map((n) => n.habit_id))];
    const userIds = [...new Set((pendingNotifs as NotificationRow[]).map((n) => n.user_id))];

    const [{ data: habits }, { data: profiles }] = await Promise.all([
      supabase.from('habits').select('id, name, icon').in('id', habitIds),
      supabase.from('profiles').select('id, expo_push_token').in('id', userIds),
    ]);

    const habitMap = new Map<string, HabitRow>(
      (habits as HabitRow[]).map((h) => [h.id, h])
    );
    const profileMap = new Map<string, ProfileRow>(
      (profiles as ProfileRow[]).map((p) => [p.id, p])
    );

    // Build push messages
    const messages = (pendingNotifs as NotificationRow[])
      .map((n) => {
        const habit = habitMap.get(n.habit_id);
        const profile = profileMap.get(n.user_id);
        if (!habit || !profile?.expo_push_token) return null;

        return {
          to: profile.expo_push_token,
          title: `${habit.icon ?? '⭐'} ${habit.name}`,
          body: 'Alışkanlığını tamamlama zamanı!',
          data: { habitId: habit.id },
          categoryIdentifier: 'HABIT_REMINDER',
          sound: 'default',
        };
      })
      .filter(Boolean);

    // Send to Expo Push API in chunks of 100
    const CHUNK_SIZE = 100;
    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);
      await fetch(EXPO_PUSH_API, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
    }

    // Mark notifications as sent
    const sentIds = (pendingNotifs as NotificationRow[]).map((n) => n.id);
    await supabase
      .from('notification_schedule')
      .update({ sent: true, sent_at: now.toISOString() })
      .in('id', sentIds);

    return new Response(JSON.stringify({ sent: sentIds.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-notifications error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
