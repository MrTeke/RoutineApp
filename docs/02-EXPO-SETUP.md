# HabitFlow — Expo Kurulum Rehberi

## İlk Kurulum

```bash
# Proje dizinine gir
cd C:\Users\akin-\Projects\RoutineApp

# Projeyi başlat
npx expo start

# iOS Simulator (macOS gerekli)
npx expo start --ios

# Android Emulator
npx expo start --android
```

## .env.local Yapılandırması
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## app.json Önemli Ayarlar
- `bundleIdentifier`: `com.habitflow.app` (iOS)
- `package`: `com.habitflow.app` (Android)
- `scheme`: `habitflow` (deep link şeması)
- expo-notifications plugin eklendi

## Dosya Yapısı (expo-router)
```
app/
├── _layout.tsx          # Root: auth guard + push token + notification listener
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx      # Tab bar (Dashboard, Alışkanlıklar, İstatistikler)
│   ├── index.tsx        # Dashboard
│   ├── habits.tsx       # Alışkanlık listesi
│   └── stats.tsx        # İstatistikler
└── habit/
    ├── new.tsx          # Yeni alışkanlık (modal)
    └── [id].tsx         # Düzenle/sil (modal)
```

## Auth Akışı
1. Uygulama açılır → `_layout.tsx` auth state'i dinler
2. Session yoksa → `/(auth)/login`'e yönlendirir
3. Login/Register başarılı → `/(tabs)`'e yönlendirir
4. Yönlendirmeyle birlikte push token kaydedilir

## Push Notification Kurulumu (Fiziksel Cihaz)
1. Fiziksel iOS/Android cihazda uygulamayı çalıştır
2. İzin istenir → "İzin Ver" seç
3. Token `profiles.expo_push_token` kolonuna kaydedilir
4. Emülatörde push notification **çalışmaz**
