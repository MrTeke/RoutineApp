# HabitFlow — Claude Rehberi

## Proje Özeti
React Native (Expo) alışkanlık takip uygulaması. Backend: Supabase. State: Zustand. Navigation: expo-router.

## Kritik Kurallar
- `SUPABASE_SERVICE_ROLE_KEY` asla client bundle'a girmemeli (sadece Edge Function'da)
- TypeScript tipleri **yalnızca** `lib/supabase.ts`'de tanımlanır, başka yerde tip tanımı yapma
- Tüm DB sorguları RLS uyumlu olmalı — `auth.uid()` filtresi
- Yeni bağımlılık eklemeden önce onay al
- `npm install --legacy-peer-deps` kullan (peer dep çakışması var)

## Dosya Sorumlulukları
| Dosya | Görev |
|-------|-------|
| `lib/supabase.ts` | Supabase client + TÜM TypeScript tipleri |
| `lib/notifications.ts` | Push token + notification response listener |
| `lib/scheduler.ts` | Bildirim zamanlama mantığı |
| `lib/store.ts` | Zustand global state |
| `supabase/functions/send-notifications/index.ts` | Edge Function |

## Geliştirme Notları
- Expo SDK 55 kullanılıyor
- `expo start` ile başlat, fiziksel cihaz için Expo Go app gerekli
- Emülatörde push notification test edilemez
- DB migration'ları `supabase/migrations/` altında sıralı SQL dosyaları olarak

## Sık Kullanılan Komutlar
```bash
npx expo start              # Geliştirme sunucusu
npx expo start --clear      # Cache temizleyerek başlat
npx tsc --noEmit            # Type check
npx expo-doctor             # Expo sağlık kontrolü
```
