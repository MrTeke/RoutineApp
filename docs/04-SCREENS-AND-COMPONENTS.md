# HabitFlow — Ekranlar ve Bileşenler

## Bileşenler

### `components/HabitCard.tsx`
Alışkanlık kartı. Props:
- `habit: Habit` — alışkanlık verisi
- `todayLogs: HabitLog[]` — bugünkü tüm loglar (filtre kart içinde yapılır)
- `onLog(habitId)` — "Yaptım" butonuna basınca
- `onPress()` — karta tıklanınca (düzenleme ekranına git)

İçeriği:
- İkon + İsim + "X/Y tamamlandı" bilgisi
- "Yaptım" butonu (tamamlanınca renk alır, haptic feedback)
- Progress bar (tamamlanma yüzdesi)

### `components/ProgressRing.tsx`
Dairesel ilerleme göstergesi (react-native-svg kullanır).
Props: `progress (0-1)`, `size`, `strokeWidth`, `color`, `label`

## Ekranlar

### `app/(tabs)/index.tsx` — Dashboard
- Üst kısım: selamlama + `ProgressRing` (günlük genel tamamlanma)
- Mor özet kartı: "X/Y alışkanlık tamamlandı"
- Alışkanlık listesi + "Ekle" butonu
- Boş durum: alışkanlık yoksa yönlendirme butonu

### `app/(tabs)/habits.tsx` — Alışkanlık Listesi
- Tüm aktif alışkanlıkların listesi
- Sağ alt köşede FAB (+ butonu)
- Karta tıklanınca `/habit/[id]` düzenleme ekranı

### `app/(tabs)/stats.tsx` — İstatistikler
- Son 30 günlük loglar çekilir
- Her alışkanlık için streak hesaplanır
- 7+ günlük serilerde 🔥 emoji gösterilir

### `app/habit/new.tsx` — Yeni Alışkanlık (Modal)
Form alanları:
- Ad (zorunlu), Açıklama
- İkon seçici (10 emoji)
- Renk seçici (7 renk)
- Günlük hedef
- Bildirim tipi segmented control + ilgili alanlar

### `app/habit/[id].tsx` — Düzenleme (Modal)
- `new.tsx` ile aynı form, mevcut değerlerle dolu
- Alt kısımda kırmızı "Alışkanlığı Sil" butonu (soft delete)

## Akışlar

### Alışkanlık Ekleme
```
new.tsx → addHabit() →
  Supabase INSERT habits →
  generateSchedule() →
  Supabase INSERT notification_schedule (7 günlük)
```

### "Yaptım" Butonu (Uygulama)
```
HabitCard onLog → logHabit(habitId, 'manual') →
  Supabase INSERT habit_logs →
  Zustand state güncellenir →
  Card progress bar güncellenir
```

### "Yaptım" Bildirimi
```
Bildirim gelir → kullanıcı DONE'a basar →
  setupNotificationResponseListener →
  logHabit(habitId, 'notification')
```
