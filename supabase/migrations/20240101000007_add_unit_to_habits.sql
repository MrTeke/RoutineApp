alter table public.habits
  add column unit text;

comment on column public.habits.unit is
  'Hedef birimi (opsiyonel). Örn: sayfa, bardak, dakika, tekrar';
