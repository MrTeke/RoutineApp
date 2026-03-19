# HabitFlow — Bildirim Motoru

## Mimari

```
Alışkanlık Ekle
     │
     ▼
lib/scheduler.ts → generateSchedule()
     │
     ▼
notification_schedule tablosuna kaydet
     │
     ▼ (pg_cron, her saat başı)
Edge Function: send-notifications
     │
     ▼
Expo Push API → Kullanıcı telefonuna bildirim
     │
     ▼ (kullanıcı bildirime tıklar)
setupNotificationResponseListener
     │
     ├── DONE  → logHabit(habitId, 'notification')
     └── SNOOZE → 15 dk sonra tekrar bildirim
```

## 3 Bildirim Tipi

### 1. Interval (Aralıklı)
Her N dakikada bir bildirim gönderir (08:00–22:00 arası).
- Parametre: `notification_interval_minutes` (örn. 120 = 2 saatte bir)

### 2. Fixed (Sabit)
Belirli saatlerde bildirim gönderir.
- Parametre: `notification_times` array (örn. `["09:00", "13:00", "21:00"]`)

### 3. Smart (Akıllı)
Belirtilen zaman penceresi içinde `target_per_day` kadar bildirimi eşit aralıklarla dağıtır.
- Parametreler: `smart_window_start`, `smart_window_end`

## Edge Function Deployment

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Edge Function deploy
supabase functions deploy send-notifications --no-verify-jwt

# Service role key'i secret olarak ayarla
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Manuel test
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

## iOS Action Buttons
`setupNotificationCategories()` fonksiyonu `_layout.tsx`'de çalışır:
- **Yaptım ✓** (identifier: `DONE`) — `opens_app_to_foreground: false`
- **15 dk sonra hatırlat** (identifier: `SNOOZE`) — `opens_app_to_foreground: false`

## Güvenlik
- `SUPABASE_SERVICE_ROLE_KEY` asla client bundle'a girmemeli
- Edge Function `--no-verify-jwt` flag'i ile deploy edilir (pg_cron service key kullanır)
