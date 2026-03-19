# HabitFlow — Veritabanı Şeması

## Kurulum Adımları

1. supabase.com → yeni proje oluştur (`habitflow`, eu-central-1)
2. `.env.local` dosyasına URL ve anon key'i ekle
3. Migration dosyalarını sırayla SQL editörde çalıştır
4. pg_cron extension'ı aktif et (Database → Extensions)

## Tablolar

### profiles
`auth.users` tablosunu genişletir. `handle_new_user` trigger'ı ile otomatik oluşur.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK) | auth.users referansı |
| email | text | Kullanıcı e-postası |
| full_name | text | Ad soyad |
| expo_push_token | text | Expo push token |
| created_at | timestamptz | Oluşturma tarihi |
| updated_at | timestamptz | Güncelleme tarihi |

### habits
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK) | |
| user_id | uuid (FK) | profiles.id |
| name | text | Alışkanlık adı |
| description | text | Açıklama |
| icon | text | Emoji |
| color | text | Hex renk kodu |
| notification_type | enum | interval / fixed / smart |
| notification_interval_minutes | integer | interval tipi için dakika |
| notification_times | text[] | fixed tipi için ["09:00","21:00"] |
| smart_window_start | text | smart tipi için "09:00" |
| smart_window_end | text | smart tipi için "21:00" |
| target_per_day | integer | Günlük hedef (kaç kez) |
| is_active | boolean | Soft delete için |

### habit_logs
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK) | |
| habit_id | uuid (FK) | habits.id |
| user_id | uuid (FK) | profiles.id |
| logged_at | timestamptz | Kayıt zamanı |
| source | enum | manual / notification |
| note | text | Opsiyonel not |

### notification_schedule
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK) | |
| habit_id | uuid (FK) | habits.id |
| user_id | uuid (FK) | profiles.id |
| scheduled_at | timestamptz | Gönderilecek zaman |
| sent | boolean | Gönderildi mi |
| sent_at | timestamptz | Gönderilme zamanı |

## RLS Politikaları
Tüm tablolarda `auth.uid() = user_id` (veya `= id`) filtresi uygulanır.
Migration: `supabase/migrations/20240101000005_rls_policies.sql`
