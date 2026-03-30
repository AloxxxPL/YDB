# Supabase — architektura backendu YDB

## Dlaczego Supabase

YDB wymaga trwałego przechowywania danych użytkownika (profil, plan diety)
z dostępem z wielu urządzeń po zalogowaniu. Supabase dostarcza:

- **Auth** — email/hasło, Google SSO, Apple SSO (zgodnie z designem)
- **PostgreSQL** — relacyjna baza idealna dla struktury `profiles → diet_plans → meals`
- **Row Level Security (RLS)** — każdy user widzi tylko swoje dane bez dodatkowego kodu
- **SDK dla React Native** — działa natywnie z Expo (`@supabase/supabase-js`)
- **Darmowy tier** — 500MB bazy, 50k aktywnych użytkowników/miesiąc

---

## Schemat bazy danych

### Tabela: `profiles`
| kolumna     | typ          | opis                                    |
|-------------|--------------|-----------------------------------------|
| id          | uuid PK      | = `auth.users.id` (Supabase Auth)       |
| name        | text         | imię z formularza onboardingu           |
| gender      | text         | `'male'` / `'female'`                   |
| age         | int          | wiek w latach                           |
| height_cm   | int          | wzrost w cm                             |
| weight_kg   | numeric      | waga w kg                               |
| goal        | text         | `'lose'` / `'muscle'` / `'healthy'`     |
| created_at  | timestamptz  | auto (Supabase default)                 |

### Tabela: `diet_plans`
| kolumna       | typ          | opis                                    |
|---------------|--------------|-----------------------------------------|
| id            | uuid PK      |                                         |
| user_id       | uuid FK      | → `profiles.id`                         |
| plan_json     | jsonb        | wygenerowany plan diety (Gemini output) |
| generated_at  | timestamptz  | kiedy plan został wygenerowany          |
| is_active     | bool         | czy to aktywny plan użytkownika         |

### Tabela: `meals` (przyszłość)
| kolumna       | typ      | opis                                    |
|---------------|----------|-----------------------------------------|
| id            | uuid PK  |                                         |
| diet_plan_id  | uuid FK  | → `diet_plans.id`                       |
| day           | int      | dzień tygodnia (1–7)                    |
| meal_number   | int      | posiłek #1 / #2 / #3                   |
| name          | text     | nazwa posiłku                           |
| ingredients   | jsonb    | składniki + makroskładniki              |

---

## Przepływ danych

```
1. Rejestracja
   → Supabase Auth tworzy rekord w auth.users

2. Onboarding (formularze)
   → dane zbierane lokalnie w Zustand (store/app.ts → formsCompleted)

3. Koniec onboardingu (goal.tsx)
   → INSERT INTO profiles (jednorazowo, przy pierwszym logowaniu)
   → Gemini call: profil użytkownika → prompt → plan diety jako JSON
   → INSERT INTO diet_plans z plan_json

4. Kolejne logowania
   → SELECT profile + aktywny diet_plan
   → hydrate Zustand (dane dostępne w całej aplikacji)
```

---

## Integracja z istniejącym kodem

`store/auth.ts` ma już `token` i `userId` — Supabase zwraca te wartości
w `session` po zalogowaniu. Wystarczy podmienić mock na:

```ts
const { data: { session } } = await supabase.auth.signInWithPassword({
  email,
  password,
})
setToken(session.access_token)
// userId = session.user.id
```

---

## Zustand jako cache

Po załadowaniu z Supabase dane profilu i planu diety żyją w Zustand —
nie odpytujemy bazy przy każdym renderze. Refresh tylko przy:
- logowaniu / ponownym otwarciu aplikacji
- zmianie profilu przez użytkownika
- regeneracji planu diety (np. po zmianie celu)

---

## Zastąpienie flagi `formsCompleted`

Obecnie `formsCompleted` w `store/app.ts` to prosta flaga in-memory —
gubi się przy restarcie aplikacji. Po integracji Supabase zastępujemy ją
sprawdzeniem czy profil istnieje w bazie:

```ts
// app/index.tsx — useEffect po zalogowaniu
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', userId)
  .single()

if (!profile) {
  router.replace('/forms/name')
}
```

---

## TODO — kroki implementacji

- [ ] Zainstalować `@supabase/supabase-js` i `@supabase/ssr`
- [ ] Stworzyć projekt na [supabase.com](https://supabase.com)
- [ ] Dodać do `.env`:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- [ ] Stworzyć `services/supabase.ts` — klient Supabase
- [ ] Wykonać migracje SQL dla tabel: `profiles`, `diet_plans`, `meals`
- [ ] Włączyć Row Level Security na wszystkich tabelach
- [ ] Podpiąć Auth do `store/auth.ts` (zastąpić mock)
- [ ] Po onboardingu — zapis profilu do Supabase (`goal.tsx`)
- [ ] Zastąpić flagę `formsCompleted` sprawdzeniem profilu w bazie
