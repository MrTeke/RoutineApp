# HabitFlow — Proje Genel Bakış

## Uygulama Hakkında
HabitFlow, kullanıcıların günlük alışkanlıklarını takip etmesine yardımcı olan bir React Native (Expo) uygulamasıdır.

## Temel Özellikler
- Alışkanlık oluşturma (3 farklı bildirim tipi: aralıklı, sabit, akıllı)
- Push notification ile hatırlatmalar
- "Yaptım" butonu (hem uygulamadan hem bildirimden)
- Dashboard'da günlük ilerleme
- Streak takibi ve istatistikler

## Tech Stack
| Katman | Teknoloji |
|--------|-----------|
| Mobile | Expo (React Native) + TypeScript |
| Navigation | expo-router (file-based) |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Notifications | expo-notifications + Expo Push API |
| Styling | React Native StyleSheet |

## Klasör Yapısı
```
RoutineApp/
├── app/
│   ├── _layout.tsx          # Root layout + auth guard
│   ├── (auth)/              # Login & Register
│   ├── (tabs)/              # Ana sekmeler
│   └── habit/               # Yeni/düzenleme ekranları
├── components/              # Yeniden kullanılabilir bileşenler
├── lib/                     # Supabase, store, notifications, scheduler
├── supabase/
│   ├── migrations/          # DB migration SQL dosyaları
│   └── functions/           # Edge Functions
└── docs/                    # Bu dökümanlar
```

## Renk Paleti
- Primary: `#6C5CE7` (mor)
- Success: `#00B894` (yeşil)
- Danger: `#D63031` (kırmızı)
- Background: `#F8F7FF`
- Text: `#2D3436`
