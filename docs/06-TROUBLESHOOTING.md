# HabitFlow — Sorun Giderme

## Yaygın Sorunlar

### Push notification gelmiyor
- Fiziksel cihaz kullandığından emin ol (emülatörde çalışmaz)
- `profiles.expo_push_token` kolonunun dolu olduğunu kontrol et
- Edge Function loglarını kontrol et: Supabase Dashboard → Edge Functions → Logs
- pg_cron kurulumunu kontrol et: `select * from cron.job;`

### "Yaptım" butonuna basınca hata alıyorum
- RLS politikalarını kontrol et: kullanıcı kendi habit_logs'ına yazabilmeli
- `auth.uid()` değerinin `user_id` ile eşleştiğini doğrula

### Supabase bağlantı hatası
- `.env.local` dosyasındaki URL ve anon key'i kontrol et
- Supabase projesinin aktif olduğunu doğrula (pause durumunda değil)

### `expo start` başlamıyor
```bash
# Cache temizle
npx expo start --clear

# node_modules temizle
rm -rf node_modules && npm install
```

### TypeScript hataları
- `lib/supabase.ts`'deki tiplerin DB şemasıyla uyumlu olduğunu kontrol et
- `npx tsc --noEmit` ile type check yap

### Android build hatası
- `android/app/build.gradle`'da minSdkVersion 21+ olduğundan emin ol
- EAS build loglarını kontrol et

### iOS bildirim izni reddedildi
- Ayarlar → HabitFlow → Bildirimler → İzin Ver
- Uygulama yeniden başlatıldığında tekrar izin istenmez, manuel ayar gerekir

## Supabase Edge Function Debug
```bash
# Local'de çalıştır
supabase functions serve send-notifications

# Log izle
supabase functions logs send-notifications --tail

# Manuel test
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/send-notifications' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --data '{}'
```

## Bağımlılık Sorunları
```bash
# Peer dependency çakışmalarında
npm install --legacy-peer-deps

# Expo SDK versiyonunu kontrol et
npx expo-doctor
```
