# HabitFlow — EAS Build & Store Deploy Rehberi

## Hazırlık

```bash
# EAS CLI kurulumu
npm install -g eas-cli

# Expo hesabına giriş
eas login

# EAS konfigürasyonu (eas.json oluşturur, EAS project ID alır)
eas build:configure
```

## eas.json
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Build Komutları

```bash
# Preview build (fiziksel cihaz testi)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Sadece iOS
eas build --profile production --platform ios

# Sadece Android
eas build --profile production --platform android
```

## App Store Submit

### Apple (iOS)
1. App Store Connect'te yeni uygulama oluştur
2. Bundle ID: `com.habitflow.app`
3. Apple Developer Program: $99/yıl
```bash
eas submit --platform ios --latest
```

### Google Play (Android)
1. Google Play Console'da yeni uygulama oluştur
2. Package name: `com.habitflow.app`
3. Google Play Developer: $25 (tek seferlik)
```bash
eas submit --platform android --latest
```

## Checklist

- [ ] App icon (1024x1024 PNG, şeffaf arka plan yok)
- [ ] Splash screen
- [ ] Ekran görüntüleri (iOS: 6.7", Android: çeşitli)
- [ ] Uygulama açıklaması (TR + EN)
- [ ] Gizlilik politikası URL'i (gerekli)
- [ ] Push notification testi (fiziksel cihazda)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY` EAS secret olarak ayarla

## EAS Secrets
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```
