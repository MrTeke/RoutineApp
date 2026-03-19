# HabitFlow — Geliştirme Yol Haritası

## Faz 1: DB + Auth + İskelet  ✅ Tamamlandı

### Expo Kurulumu
- [x] Expo projesi oluşturuldu (`blank-typescript`, SDK 55 → 54'e downgrade edildi)
- [x] `expo-router/entry` entry point ayarlandı
- [x] `.npmrc` → `legacy-peer-deps=true` (peer dep çakışması kalıcı çözüldü)
- [x] `app.json` güncellendi (HabitFlow, bundleIdentifier, notifications plugin)
- [x] `app.json` asset referansları düzeltildi (`android-icon-foreground.png`, notification-icon kaldırıldı)
- [x] SDK 54'e downgrade + tüm bağımlılıklar `npx expo install --fix` ile hizalandı
- [x] `babel.config.js` oluşturuldu (`react-native-worklets/plugin` — reanimated v4 zorunluluğu)
- [x] `react-native-worklets` 0.7.4 → 0.5.1'e downgrade edildi (Expo Go mismatch hatası)
- [x] Eksik paketler eklendi: `expo-linking`, `react-native-screens`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`
- [x] **Expo Go ile uygulama başarıyla açıldı (giriş ekranı görüntülendi)**

### Bağımlılıklar
- [x] expo-router, expo-notifications, expo-device, expo-constants
- [x] @supabase/supabase-js, @react-native-async-storage/async-storage
- [x] zustand, expo-linear-gradient, expo-haptics, react-native-svg

### Kaynak Dosyalar
- [x] `lib/supabase.ts` — Client + TypeScript tipleri (Profile, Habit, HabitLog, NotificationSchedule)
- [x] `lib/notifications.ts` — registerForPushNotifications, savePushToken, setupNotificationResponseListener, setupNotificationCategories
- [x] `lib/scheduler.ts` — generateSchedule (interval / fixed / smart mantığı)
- [x] `lib/store.ts` — Zustand store (fetchHabits, addHabit, updateHabit, deleteHabit, logHabit)
- [x] `app/_layout.tsx` — Auth guard + push token akışı + notification listener

### Auth Ekranları
- [x] `app/(auth)/login.tsx`
- [x] `app/(auth)/register.tsx`

### DB Migrations (SQL dosyaları hazır, henüz çalıştırılmadı)
- [x] `20240101000001_create_profiles.sql` + `handle_new_user` trigger
- [x] `20240101000002_create_habits.sql`
- [x] `20240101000003_create_habit_logs.sql`
- [x] `20240101000004_create_notification_schedule.sql`
- [x] `20240101000005_rls_policies.sql`
- [x] `20240101000006_pg_cron_setup.sql`

---

## Faz 2: Core Özellikler  ✅ Tamamlandı

### Bildirim Motoru
- [x] `lib/scheduler.ts` — interval / fixed / smart slot üretimi
- [x] `supabase/functions/send-notifications/index.ts` — Edge Function
- [x] iOS action button kategorileri — DONE + SNOOZE (`_layout.tsx`)
- [x] Supabase projesi oluşturuldu (habitflow)
- [x] `.env.local`'e gerçek URL + anon key girildi
- [x] Tablolar oluşturuldu (profiles, habits, habit_logs, notification_schedule)
- [x] Edge Function deploy edildi: `send-notifications`
- [x] pg_cron job kuruldu — her saat başı Edge Function tetikleniyor
- [ ] Manuel test (curl ile Edge Function çağır)

### Alışkanlık CRUD
- [x] `app/habit/new.tsx` — 3 bildirim tipli yeni alışkanlık formu
- [x] `app/habit/[id].tsx` — Düzenleme + soft delete
- [x] `components/HabitCard.tsx` — Progress bar + Yaptım butonu + haptic feedback

### Bug Fix'ler (gerçek veri testi öncesi)
- [x] Dashboard `HabitCard` onPress no-op düzeltildi → `router.push('/habit/[id]')`
- [x] Store action hataları artık `error` state'e yazılıyor, UI'da `Alert` ile gösteriliyor
- [x] Yeni alışkanlık formunda HH:MM zaman format validasyonu eklendi
- [x] Push token `getExpoPushTokenAsync` hatası try/catch ile sarmalandı (EAS projectId eksikken crash olmaz)

---

## Faz 3: Dashboard & Stats  ✅ Tamamlandı

- [x] `components/ProgressRing.tsx` — SVG dairesel ilerleme göstergesi
- [x] `app/(tabs)/index.tsx` — Dashboard (ProgressRing + alışkanlık listesi + boş durum)
- [x] `app/(tabs)/habits.tsx` — Alışkanlık listesi + FAB
- [x] `app/(tabs)/stats.tsx` — Streak takibi (son 30 gün)
- [x] Gerçek verilerle test tamamlandı (Expo Go + Supabase)

---

## Faz 3.5: UI/UX İyileştirmeleri  ✅ Tamamlandı

- [x] `app/(tabs)/_layout.tsx` — Emoji ikonlar → `@expo/vector-icons` Ionicons (aktif/pasif çift)
- [x] `app/(auth)/login.tsx` — Mor `LinearGradient` header + beyaz form kartı + input focus rengi + `FadeInDown` animasyonu
- [x] `app/(auth)/register.tsx` — Aynı login iyileştirmeleri
- [x] `components/HabitCard.tsx` — Reanimated animasyonları: progress bar `withTiming`, buton press `withSpring`, tamamlama badge scale + checkmark opacity
- [x] `app/(tabs)/index.tsx` — Progress'e göre motivasyon mesajı + pull-to-refresh (`RefreshControl`)

---

## Faz 3.6: Adaptif Hedef Sistemi  ✅ Tamamlandı

### Birim (unit) Desteği
- [x] `supabase/migrations/20240101000007_add_unit_to_habits.sql` — `unit` kolonu eklendi (Supabase'de çalıştırıldı)
- [x] `lib/supabase.ts` — `Habit` tipine `unit: string | null` eklendi
- [x] `app/habit/new.tsx` — "Birim" TextInput eklendi (örn. sayfa, bardak, tekrar)
- [x] `app/habit/[id].tsx` — Düzenleme formuna "Birim" TextInput eklendi
- [x] `components/HabitCard.tsx` — `"3/20 sayfa tamamlandı"` formatı (unit null ise sadece `"3/20"`)

### Adaptif Hedef Motoru
- [x] `lib/adaptive.ts` — Günlük analiz motoru
  - 30 gün ≥ %90 tamamlama → hedef artırma önerisi (×1.33)
  - 14 gün ≤ %40 tamamlama → hedef azaltma önerisi (×0.6)
  - Günde 1 kez çalışır (AsyncStorage throttle: `adaptive_last_check`)
  - Öneriler sırayla Alert ile gösterilir, kullanıcı onaylarsa `updateHabit` çağrılır
- [x] `app/(tabs)/index.tsx` — Habits yüklendikten sonra `runAdaptiveCheck` tetikleniyor

---

## Faz 3.7: UI/UX — Time Picker  ✅ Tamamlandı

- [x] `components/TimePickerModal.tsx` — Custom saat seçici (Modal + grid, yeni bağımlılık yok)
- [x] `app/habit/new.tsx` — `fixedTimes: string[]`, chip UI, "+ Saat Ekle", smart mod butonları
- [x] `app/habit/[id].tsx` — Aynı UI değişiklikleri, mevcut saatler chip olarak gösteriliyor

---

## Faz 4: Deploy  🔄 Devam Ediyor

### Tamamlananlar
- [x] Edge Function manuel testi — `{"sent":0}` döndü (başarılı)
- [x] EAS CLI kurulumu (`eas-cli/18.3.0`)
- [x] `eas login` — hesap: tekeshi / akinteke1996@gmail.com
- [x] `eas build:configure` — EAS project oluşturuldu (@tekeshi/habitflow)
- [x] `app.json`'a EAS `projectId` eklendi (`dc042df3-c90f-4cd4-9caf-82cd469fb979`)
- [x] `eas.json` oluşturuldu (development / preview / production profilleri)

### Yapılacaklar

#### App Icon & Splash
- [ ] App icon (1024×1024, PNG, şeffaflık yok) + splash screen

#### EAS Yeniden Yapılandırma (slug değişti: habitflow → lumi)
- [ ] `eas build:configure` tekrar çalıştır → yeni EAS project (@tekeshi/lumi)
- [ ] `app.json`'daki `projectId`'yi yeni değerle güncelle

#### TestFlight
- [ ] `eas build --platform ios --profile preview` → TestFlight'a yükle
- [ ] Push notification E2E testi (Expo Go bağımsız, gerçek cihaz)
- [ ] Şifre sıfırlama deep link testi (`lumi://reset-password`)

#### App Store Submission Hazırlığı
- [ ] Apple Developer hesabı aktif mi kontrol et ($99/yıl)
- [ ] Privacy Policy sayfası yayınla (Apple zorunlu tutuyor)
- [ ] App Store Connect'te uygulama kaydı oluştur
- [ ] Ekran görüntüleri hazırla (en az iPhone 6.5" — 1290×2796)
- [ ] App açıklaması, keywords, kategori seç (Health & Fitness önerilir)
- [ ] `eas build --platform ios --profile production`
- [ ] `eas submit --platform ios`

---

## Faz 5: UI Polish & Özellikler  🔄 Devam Ediyor

### A — Onboarding  ✅ Tamamlandı
- [x] `app/onboarding.tsx` — 4 slide, LinearGradient arka plan, dot indikatör, İleri/Geç/Başla butonları
- [x] `app/_layout.tsx` — AsyncStorage `onboarding_done` kontrolü, ilk açılışta `/onboarding`'e yönlendirme

### B — Streak Ekranı Geliştirme  ✅ Tamamlandı
- [x] Stats ekranına 5 haftalık (35 hücre) takvim grid (GitHub contribution tarzı)
- [x] Her hücre: tamamlandı → habit rengi, yapılmadı → gri, gelecek → boş, bugün → renk çerçeveli
- [x] Pazartesi hizalı sütun başlıkları (Pzt–Paz)
- [x] Header: icon badge + habit adı + toplam gün sayısı + streak badge
- [x] Mevcut 7 günlük dot kaldırıldı, yerine tam takvim

### C — Form UX İyileştirme  ✅ Tamamlandı
- [x] `app/habit/new.tsx` — `KeyboardAvoidingView`, 4 section card (Temel/Görünüm/Hedef/Bildirimler), input focus state, radio-button bildirim seçici
- [x] `app/habit/[id].tsx` — Aynı iyileştirmeler, sil butonu korundu
- [x] Günlük hedef + birim yan yana tek satırda
- [x] Akıllı mod: başlangıç→bitiş tek satır ok ile gösterimi
- [x] İkon seçiminde seçili renk vurgusu

### D — TestFlight Build
- [ ] App icon (1024×1024) + splash screen finalize
- [ ] `eas build --platform ios --profile preview` → TestFlight
- [ ] Native push notification testi (Expo Go bağımsız)

### E — Profil Ekranı  ✅ Tamamlandı
- [x] `app/(tabs)/profile.tsx` — Avatar (initials), isim inline düzenleme, email, üyelik tarihi
- [x] İstatistik kartı: aktif alışkanlık sayısı + toplam tamamlama
- [x] Push bildirim durumu (yeşil/turuncu indikatör)
- [x] Çıkış yap (Alert onayı)
- [x] Tab bar'a 4. sekme olarak eklendi (person ikonu)

### F — Sosyal Paylaşım  ✅ Tamamlandı
- [x] `react-native-view-shot` + `expo-sharing` kuruldu
- [x] `components/ShareCard.tsx` — 360×200 PNG kartı (habit rengi gradient, büyük streak sayısı, dekoratif çemberler)
- [x] `app/(tabs)/stats.tsx` — her streak kartına "↗ Streakini Paylaş" butonu (streak > 0 ise görünür)
- [x] `ViewShot` off-screen (-9999px) konumlanır, yakalanır, `Sharing.shareAsync` ile native sheet açılır

---

## ⏭️ Sıradaki Adım

**App Store Publish — Sıradaki Seans**

Sırasıyla yapılacaklar:

1. **EAS yeniden yapılandır** (slug habitflow → lumi değişti)
   - `eas build:configure` → yeni EAS project `@tekeshi/lumi`
   - `app.json` `projectId`'yi yeni değerle güncelle
   - Supabase Dashboard'da redirect URL'i `habitflow://reset-password` → `lumi://reset-password` olarak güncelle
   - `app.json` scheme'i `"lumi"` olarak kontrol et (zaten lumi, ama EAS kayıt yenilenmeli)

2. **`eas build --platform ios --profile preview`** → TestFlight'a yükle

3. **Native test** (gerçek cihaz, Expo Go bağımsız)
   - Push notification E2E
   - Şifre sıfırlama deep link (`lumi://reset-password`)

4. **Privacy Policy** yayınla (Apple zorunlu — basit web sayfası yeterli)

5. **App Store Connect** — uygulama kaydı oluştur

6. **Ekran görüntüleri** hazırla (iPhone 6.5" — 1290×2796, min. 3 adet)

7. **`eas build --platform ios --profile production`** + **`eas submit --platform ios`**
