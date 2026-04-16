# YDB — Pełna dokumentacja projektu

## Spis treści
1. [Przegląd projektu](#1-przegląd-projektu)
2. [Stack technologiczny](#2-stack-technologiczny)
3. [Zmienne środowiskowe](#3-zmienne-środowiskowe)
4. [Architektura — schemat](#4-architektura--schemat)
5. [Routing](#5-routing)
6. [Typy](#6-typy)
7. [Store (Zustand)](#7-store-zustand)
8. [Serwisy](#8-serwisy)
9. [Ekrany](#9-ekrany)
10. [Formularze onboardingu](#10-formularze-onboardingu)
11. [Hooks](#11-hooks)
12. [Stałe / motyw](#12-stałe--motyw)
13. [Backend — Supabase](#13-backend--supabase)
14. [Przepływ danych — onboarding end-to-end](#14-przepływ-danych--onboarding-end-to-end)
15. [TODO / elementy niegotowe](#15-todo--elementy-niegotowe)

---

## 1. Przegląd projektu

**YDB** to aplikacja mobilna React Native (Expo SDK 54) do personalizowanych planów dietetycznych. Użytkownik przechodzi onboarding (7 formularzy), na końcu profil jest zapisywany do Supabase, a Gemini AI generuje tygodniowy plan diety dopasowany do danych użytkownika. Użytkownik może później refinować plan przez chat z AI.

**Platforma:** iOS + Android (Expo Go)
**Język:** TypeScript
**UI:** NativeWind (Tailwind CSS dla RN) — styl minimalistyczny black & white

---

## 2. Stack technologiczny

| Warstwa | Biblioteka | Wersja |
|---|---|---|
| Framework | Expo | ~54.0.0 |
| Nawigacja | expo-router | ~6.0.0 |
| UI | NativeWind + TailwindCSS | ^4.2.3 / ^3.4.19 |
| State | Zustand | ^5.0.12 |
| Persystencja stanu | AsyncStorage | 2.2.0 |
| Serwer zapytań | TanStack Query | ^5.90.21 |
| Backend / Auth / DB | Supabase JS | ^2.103.0 |
| AI — generowanie diety | Google Generative AI (Gemini) | ^0.24.1 |
| Aparát / galeria | expo-image-picker | ~17.0.10 |
| Bezpieczny storage | expo-secure-store | ~15.0.8 |
| React | 19.1.0 | — |

---

## 3. Zmienne środowiskowe

Plik `.env` (lokalny, nie commitowany). Wzorzec w `.env.example`.

| Zmienna | Zakres | Opis |
|---|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | klient | Klucz API Gemini — dostępny w JS bundlu |
| `EXPO_PUBLIC_SUPABASE_URL` | klient | URL projektu Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | klient | Klucz anonimowy Supabase (anon key) |
| `EXPO_PUBLIC_API_URL` | klient | Fallback URL REST API (produkcja) |
| `EXPO_PUBLIC_PORT` | klient | Port lokalnego API dev (domyślnie `3000`) |

> Wszystkie zmienne z prefiksem `EXPO_PUBLIC_` są wbudowywane do JS bundlu przez Expo — nie umieszczaj tu sekretów serwerowych.

---

## 4. Architektura — schemat

```
┌──────────────────────────────────────────────────────────────┐
│                        Aplikacja RN                          │
│                                                              │
│  expo-router (Stack)                                         │
│  ├── index (HomeScreen)   ← formsCompleted gate             │
│  ├── diet                 ← plan tygodniowy + refinement     │
│  ├── journey              ← (stub)                           │
│  ├── chat                 ← chat z Gemini AI                 │
│  ├── profile              ← (stub)                           │
│  ├── settings             ← logout                           │
│  └── forms/               ← onboarding (7 kroków)           │
│       name → gender → age → height → weight → goal → dishes │
│                                                              │
│  Zustand store (persist → AsyncStorage)                      │
│  ├── useAppStore  — profil, tempProfile, dietPlan, flags     │
│  └── useAuthStore — token, userId (nie-persist)              │
│                                                              │
│  Serwisy                                                     │
│  ├── services/supabase.ts  — klient Supabase                 │
│  ├── services/gemini.ts    — klient Gemini AI                │
│  ├── services/diet.ts      — generowanie / refinement planu  │
│  └── services/api.ts       — REST fetch helper (dev/prod)    │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
    ┌──────────▼──────────┐        ┌───────────▼──────────────┐
    │  Supabase            │        │  Google Gemini AI         │
    │  ├── Auth (planned)  │        │  model: gemini-2.5-flash  │
    │  ├── profiles table  │        │  -lite                    │
    │  └── diet_plans table│        └──────────────────────────┘
    └─────────────────────┘
```

---

## 5. Routing

Routing oparty na **expo-router** (file-based routing). Główny layout w [app/_layout.tsx](../app/_layout.tsx).

### Mapa tras

| Ścieżka | Plik | Opis |
|---|---|---|
| `/` | `app/index.tsx` | Ekran główny (HomeScreen) — gate formularzy |
| `/diet` | `app/diet.tsx` | Tygodniowy plan diety + refinement |
| `/journey` | `app/journey.tsx` | Journey (stub — placeholder) |
| `/chat` | `app/chat.tsx` | Chat z asystentem AI (Gemini) |
| `/profile` | `app/profile.tsx` | Profil użytkownika (stub) |
| `/settings` | `app/settings.tsx` | Ustawienia — logout |
| `/forms/name` | `app/forms/name.tsx` | Onboarding krok 1 — imię |
| `/forms/gender` | `app/forms/gender.tsx` | Onboarding krok 2 — płeć |
| `/forms/age` | `app/forms/age.tsx` | Onboarding krok 3 — wiek |
| `/forms/height` | `app/forms/height.tsx` | Onboarding krok 4 — wzrost |
| `/forms/weight` | `app/forms/weight.tsx` | Onboarding krok 5 — waga |
| `/forms/goal` | `app/forms/goal.tsx` | Onboarding krok 6 — cel |
| `/forms/dishes` | `app/forms/dishes.tsx` | Onboarding krok 7 — ulubione dania + zapis |

### Logika gate w `index.tsx`

```ts
if (!formsCompleted) return <Redirect href="/forms/name" />;
```

`formsCompleted` pochodzi z `useAppStore` (persisted w AsyncStorage). Jeśli `false` → użytkownik ląduje w onboardingu.

### Konfiguracja Stack

Wszystkie ekrany mają `headerShown: false` — nawigacja jest w pełni custom.

---

## 6. Typy

### `types/index.ts`

#### `TempProfile`
Tymczasowy profil gromadzony podczas onboardingu (przed zapisem do Supabase).

```ts
type TempProfile = {
  name?: string;
  gender?: 'male' | 'female';
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goal?: ('lose' | 'muscle' | 'healthy')[];
  dishes?: string[];
};
```

#### `DietPlan` (frontend)
Struktura planu diety do wyświetlania w UI.

```ts
type DietPlan = {
  week: number;
  days: Array<{
    day: string; // "Monday", "Tuesday", ...
    meals: Array<{
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      name: string;
      description: string; // opis + kalorie/makro
    }>;
  }>;
  notes: string; // ogólne wskazówki żywieniowe
};
```

#### `AppStore`
Interfejs pełnego Zustand store (patrz sekcja [Store](#7-store-zustand)).

---

### `types/supabase.ts`

#### `Profile`
Rekord z tabeli `profiles` w Supabase.

```ts
type Profile = {
  id: string;           // = auth.users.id
  name: string;
  gender: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_kg: number;
  goal: ('lose' | 'muscle' | 'healthy')[];
  dishes: string[];
  created_at: string;
};
```

#### `DietPlan` (Supabase)
Rekord z tabeli `diet_plans`.

```ts
type DietPlan = {
  id: string;
  user_id: string;              // → profiles.id
  plan_json: Record<string, any>;
  generated_at: string;
  is_active: boolean;
};
```

---

## 7. Store (Zustand)

### `store/app.ts` — `useAppStore`

Główny store aplikacji. **Persisted** w AsyncStorage pod kluczem `'app-store'`.

| Pole | Typ | Opis |
|---|---|---|
| `isReady` | `boolean` | Flaga gotowości aplikacji |
| `token` | `string \| null` | JWT token sesji |
| `userId` | `string \| null` | ID użytkownika |
| `profile` | `Profile \| null` | Profil z Supabase |
| `tempProfile` | `TempProfile` | Dane zbierane podczas onboardingu |
| `formsCompleted` | `boolean` | Czy onboarding ukończony |
| `dietPlan` | `DietPlan \| null` | Aktualny plan diety (Gemini output) |
| `dietLoading` | `boolean` | Czy trwa generowanie diety |
| `dietError` | `string \| null` | Błąd generowania diety |

**Akcje:**

| Akcja | Opis |
|---|---|
| `setReady(ready)` | Ustawia `isReady` |
| `setToken(token)` | Ustawia token JWT |
| `setUserId(userId)` | Ustawia userId |
| `setProfile(profile)` | Ustawia pełny profil z Supabase |
| `setTempProfile(p)` | Zastępuje cały tempProfile |
| `updateTempProfile(partial)` | Merge z istniejącym tempProfile |
| `setFormsCompleted(bool)` | Ustawia flagę ukończenia onboardingu |
| `setDietPlan(plan)` | Ustawia plan diety |
| `setDietLoading(bool)` | Ustawia stan ładowania diety |
| `setDietError(err)` | Ustawia komunikat błędu diety |

---

### `store/auth.ts` — `useAuthStore`

Pomocniczy store autoryzacji. **Nie persisted** — gubi się przy restarcie.

| Pole | Typ | Opis |
|---|---|---|
| `token` | `string \| null` | JWT |
| `userId` | `string \| null` | ID użytkownika |
| `isAuthenticated` | `boolean` | Czy zalogowany |

**Akcje:**

| Akcja | Opis |
|---|---|
| `setToken(token)` | Ustawia token i `isAuthenticated = true` |
| `clearAuth()` | Czyści wszystkie pola auth |

> **Uwaga:** `useAuthStore` jest niezintegrowany z aktualnym flow — główna logika auth odbywa się w `useAppStore`. `useAuthStore` to pozostałość wczesnej architektury.

---

## 8. Serwisy

### `services/supabase.ts`

Inicjalizacja klienta Supabase. Eksportuje singleton `supabase`.

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Używany bezpośrednio w `app/forms/dishes.tsx` do INSERT profilu.

---

### `services/gemini.ts`

Inicjalizacja klienta Google Generative AI. Eksportuje singleton `geminiModel`.

```ts
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
```

Model: `gemini-2.5-flash-lite` — szybki, lekki model Gemini.
Używany w: `services/diet.ts`, `app/chat.tsx`.

---

### `services/diet.ts`

Logika generowania i refinementu planu diety przez Gemini.

#### `generateDietPlan(profile: Profile): Promise<DietPlan>`

Buduje prompt z danych profilu i wywołuje Gemini. Oczekuje odpowiedzi w formacie JSON (raw, bez markdown).

**Prompt zawiera:**
- Imię, wiek, płeć, wzrost, wagę, cele, ulubione dania
- Instrukcję wygenerowania 7-dniowego planu z śniadaniem, lunchem, kolacją i przekąskami
- Wymaganie zwrotu TYLKO czystego JSON

**Parsowanie:**
1. Ekstrakcja JSON z odpowiedzi regexem `/{[\s\S]*}/`
2. `JSON.parse()` do `DietPlan`
3. Walidacja: czy `days` jest tablicą 7 elementów

**Błędy:** rzuca `Error` z opisem — łapany w `dishes.tsx`.

---

#### `refineDietPlan(profile, currentPlan, feedback): Promise<DietPlan>`

Ulepsza istniejący plan na podstawie opinii użytkownika.

**Prompt zawiera:**
- Skrót aktualnego planu (dzień → lista nazw posiłków)
- Feedback użytkownika jako tekst
- Numer tygodnia = `currentPlan.week + 1`

**Używany w:** `app/diet.tsx` → `submitFeedback()`.

---

### `services/api.ts`

REST API helper dla żądań do własnego backendu (nie-Supabase).

#### `getApiBase(): string`

Dynamicznie wyznacza base URL:
- `__DEV__` + `Constants.expoConfig?.hostUri` dostępne → `http://<LAN-IP>:<EXPO_PUBLIC_PORT>`
- Brak hostUri → `EXPO_PUBLIC_API_URL` lub fallback `https://jsonplaceholder.typicode.com`

#### `apiFetch<T>(path: string): Promise<T>`

Generic fetch owijający `API_BASE + path`. Rzuca błąd przy statusie non-OK.

**Eksporty:**
- `API_BASE: string` — obliczony raz przy załadowaniu modułu
- `apiFetch<T>` — funkcja fetch

---

## 9. Ekrany

### `app/index.tsx` — HomeScreen

**Gate:** jeśli `formsCompleted === false` → `<Redirect href="/forms/name" />`.

**Wyświetla:**
- Debug panel (widoczny gdy brak planu diety lub jest błąd) — pokazuje stan `dietPlan`, `dietLoading`, `dietError`, skrót ID profilu
- 3 duże przyciski nawigacyjne (140px wysokości): Diet, Journey, Chat
- Dolny Navbar

**Navbar (komponent lokalny):**

| Element | Akcja |
|---|---|
| Lewy okrąg | `router.push('/settings')` |
| Środkowy okrąg (czarny) | `openCamera()` — otwiera aparat |
| Prawy okrąg | `router.push('/profile')` |

**Funkcja `openCamera()`:** prosi o uprawnienia przez `ImagePicker.requestCameraPermissionsAsync()`, jeśli granted → `launchCameraAsync`. Zdjęcie nie jest jeszcze nigdzie zapisywane.

---

### `app/diet.tsx` — DietScreen

Wyświetla tygodniowy plan diety i umożliwia jego refinement.

**Stany UI:**
- `dietLoading === true` → spinner + napis
- `dietError !== null` → komunikat błędu
- `!dietPlan` → komunikat o braku planu
- Plan dostępny → lista dni z posiłkami

**Wyświetlanie planu:**
- Każdy dzień = karta z granicą `border-2 border-black`
- Każdy posiłek = karta z lewym paskiem `border-l-4 border-black`, typ (capitalize), nazwa, opis

**Sekcja Customize:**
- `TextInput` — wolny tekst z feedbackiem
- Przycisk "Update Plan" → wywołuje `submitFeedback()`

**Funkcja `submitFeedback()`:**
1. Guard: `!feedback.trim() || !dietPlan || !profile` → return
2. Ustawia `isRefining = true`
3. Wywołuje `refineDietPlan(profile, dietPlan, feedback)`
4. `setDietPlan(refinedPlan)` — zastępuje plan w store
5. Alert sukcesu / błędu

---

### `app/chat.tsx` — ChatScreen

Chat z asystentem żywieniowym opartym na Gemini.

**Typ lokalny:**
```ts
type Message = { id: string; role: 'user' | 'assistant'; text: string };
```

**Stan:**
- `messages: Message[]` — historia rozmowy (startuje z wiadomością powitalną)
- `input: string` — aktualny tekst wpisywany przez użytkownika
- `isLoading: boolean` — czy czeka na odpowiedź AI
- `scrollViewRef` — referencja do ScrollView (auto-scroll do końca przy każdej nowej wiadomości)

**System prompt:** asystent dietetyczny — porady dietetyczne, przepisy, info o kaloriach, motywacja.

**Funkcja `sendMessage()`:**
1. Guard: `!input.trim()` → return
2. Dodaje wiadomość użytkownika do `messages`
3. Buduje kontekst rozmowy jako multilinię `User: ... / Assistant: ...`
4. Wywołuje `geminiModel.generateContent(prompt)` z historią + system prompt
5. Dodaje odpowiedź asystenta do `messages`
6. Na błąd → dodaje wiadomość błędu zamiast crashować

**UI:** chat bubbles — wiadomości użytkownika wyrównane do prawej (czarne tło, biały tekst), asystent do lewej (szare tło).

---

### `app/settings.tsx` — SettingsScreen

**Funkcja `logout()`:**
Czyści cały stan aplikacji i przekierowuje do początku onboardingu:
1. `setProfile(null)`
2. `setUserId(null)`
3. `setToken(null)`
4. `setFormsCompleted(false)`
5. `setDietPlan(null)`
6. `setTempProfile({})`
7. `router.replace('/forms/name')`

---

### `app/profile.tsx` — ProfileScreen

**Status:** stub — wyświetla tylko napis "Profil".

---

### `app/journey.tsx` — JourneyScreen

**Status:** stub — wyświetla tylko napis "Journey".

---

## 10. Formularze onboardingu

Sekwencja: `name → gender → age → height → weight → goal → dishes`

Każdy formularz:
- Odczytuje aktualną wartość z `useAppStore((s) => s.tempProfile.*)`
- Po zatwierdzeniu wywołuje `updateTempProfile({ field: value })`
- Przechodzi do następnego kroku przez `router.push('/forms/...')`

### `forms/name.tsx`
- Input tekstowy, `autoFocus`
- Guard: `name.trim().length > 0`

### `forms/gender.tsx`
- Dwa przyciski: Male / Female
- Klik = natychmiastowy zapis + redirect (brak osobnego "Continue")

### `forms/age.tsx`
- Input numeryczny (`keyboardType="numeric"`)
- Parsuje: `parseInt(age, 10)`

### `forms/height.tsx`
- Input numeryczny, placeholder "cm"
- Parsuje: `parseInt(height, 10)`

### `forms/weight.tsx`
- Input numeryczny, placeholder "kg"
- Parsuje: `parseFloat(weight)`

### `forms/goal.tsx`
- 3 opcje do wielokrotnego wyboru (toggle): "Drop few pounds", "Gain muscle tissue", "Create healthier habits"
- Mapuje etykiety UI na typy: `lose | muscle | healthy`
- Guard: `selected.length > 0`

### `forms/dishes.tsx` — ostatni krok + zapis

Najbardziej złożony formularz — punkt wejścia do aplikacji.

**Stan lokalny:**
- `input` — pole wpisywania nowego dania
- `dishes: string[]` — lista dodanych dań (max 10)
- `editingIndex: number | null` — indeks edytowanego elementu
- `isLoading` — blokada podczas zapisu

**Funkcje:**
- `addDish()` — dodaje lub edytuje danie; limit 10
- `removeDish(index)` — usuwa danie z listy
- `startEdit(index)` — wczytuje danie do inputa do edycji

**`confirm()` — sekwencja zapisu:**
1. Guard: `dishes.length === 0` → Alert
2. Generuje `tempUserId = 'temp-' + Date.now() + '-' + Math.random()`
3. Buduje `profileData` z danych `tempProfile` + `dishes`
4. `supabase.from('profiles').insert([profileData])` — zapis do Supabase
5. `setUserId(tempUserId)`, `setProfile(profileData)`, `setFormsCompleted(true)`
6. `setDietLoading(true)` → `generateDietPlan(profileData)` → `setDietPlan(plan)`
7. `setDietLoading(false)`
8. `router.replace('/')` — redirect do home (nawet jeśli generowanie diety się nie powiodło)

> **Uwaga:** Aktualnie używany jest tymczasowy UUID (`temp-...`) zamiast prawdziwego Supabase Auth ID. Pełna integracja Auth jest planowana.

---

## 11. Hooks

### `hooks/useExample.ts` — `usePosts()`

Hook demonstracyjny integrujący TanStack Query z `apiFetch`.

```ts
function usePosts(): UseQueryResult<Post[]>
```

- Query key: `['posts']`
- Fetches: `GET /posts?_limit=5`
- Typ lokalny `Post`: `{ id: number; title: string; body: string }`

> Ten hook nie jest aktualnie używany w żadnym ekranie. Służy jako wzorzec dla przyszłych hooków.

---

## 12. Stałe / motyw

### `constants/theme.ts`

```ts
colors = {
  primary: '#3B82F6',    // blue-500
  secondary: '#6B7280',  // gray-500
  background: '#FFFFFF',
  surface: '#F9FAFB',    // gray-50
  error: '#EF4444',      // red-500
  text: {
    primary: '#111827',   // gray-900
    secondary: '#6B7280', // gray-500
    inverse: '#FFFFFF',
  }
}

spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
```

> W praktyce UI korzysta z klas NativeWind/Tailwind zamiast tych stałych. `theme.ts` nie jest aktualnie importowany w żadnym ekranie.

### `global.css`

Plik wejściowy Tailwind CSS dla NativeWind — importowany w `app/_layout.tsx`.

---

## 13. Backend — Supabase

### Konfiguracja klienta

`services/supabase.ts`:
```ts
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
```

### Schemat bazy danych

#### Tabela `profiles`

| Kolumna | Typ | Opis |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` (docelowo) |
| `name` | text | Imię z formularza |
| `gender` | text | `'male'` \| `'female'` |
| `age` | int | Wiek w latach |
| `height_cm` | int | Wzrost w cm |
| `weight_kg` | numeric | Waga w kg |
| `goal` | text[] | `['lose', 'muscle', 'healthy']` — array wybranych celów |
| `dishes` | text[] | Ulubione dania (JSON array) |
| `created_at` | timestamptz | Auto (Supabase default) |

#### Tabela `diet_plans`

| Kolumna | Typ | Opis |
|---|---|---|
| `id` | uuid PK | — |
| `user_id` | uuid FK | → `profiles.id` |
| `plan_json` | jsonb | Wygenerowany plan diety |
| `generated_at` | timestamptz | Kiedy plan wygenerowany |
| `is_active` | bool | Aktywny plan użytkownika |

#### Tabela `meals` (planowana)

| Kolumna | Typ | Opis |
|---|---|---|
| `id` | uuid PK | — |
| `diet_plan_id` | uuid FK | → `diet_plans.id` |
| `day` | int | Dzień tygodnia (1–7) |
| `meal_number` | int | Numer posiłku |
| `name` | text | Nazwa posiłku |
| `ingredients` | jsonb | Składniki + makroskładniki |

### Row Level Security (RLS)

Planowane: każdy użytkownik widzi tylko swoje rekordy. Nie wdrożone w aktualnej wersji.

### Auth — stan aktualny vs. planowany

**Aktualnie:** brak prawdziwej autoryzacji. UUID generowany lokalnie (`temp-...`). Token i userId w store są placeholderami.

**Docelowo:**
```ts
const { data: { session } } = await supabase.auth.signInWithPassword({ email, password });
setToken(session.access_token);
// session.user.id → userId
```

---

## 14. Przepływ danych — onboarding end-to-end

```
1. Uruchomienie aplikacji
   └─ _layout.tsx: bootstrap()
       ├─ userId && profile w Zustand → setFormsCompleted(true)
       └─ brak → setFormsCompleted(false)

2. index.tsx
   └─ !formsCompleted → <Redirect href="/forms/name" />

3. Formularze (name → gender → age → height → weight → goal)
   └─ każdy krok: updateTempProfile({ field }) → router.push(next)

4. forms/dishes.tsx — confirm()
   ├─ supabase.from('profiles').insert([profileData])
   ├─ setProfile(profileData), setUserId(tempId), setFormsCompleted(true)
   ├─ setDietLoading(true)
   ├─ generateDietPlan(profileData)  ──→ Gemini API
   │   └─ parsuje JSON → DietPlan
   ├─ setDietPlan(generatedPlan), setDietLoading(false)
   └─ router.replace('/')

5. index.tsx (powrót)
   └─ formsCompleted === true → HomeScreen z przyciskami

6. diet.tsx
   └─ wyświetla plan | submitFeedback() → refineDietPlan() → Gemini → setDietPlan()

7. settings.tsx — logout()
   └─ czyści cały store → router.replace('/forms/name')
```

---

## 15. TODO / elementy niegotowe

| Element | Stan | Plik |
|---|---|---|
| Prawdziwa autoryzacja Supabase Auth | Niegotowe | `store/auth.ts`, `services/supabase.ts` |
| Zapis `diet_plans` do Supabase | Niegotowe | `services/diet.ts` |
| Ekran Profile | Stub | `app/profile.tsx` |
| Ekran Journey | Stub | `app/journey.tsx` |
| Zdjęcia z aparatu — zapisywanie | Niegotowe | `app/index.tsx` → `openCamera()` |
| Row Level Security w Supabase | Niegotowe | Supabase dashboard |
| `constants/theme.ts` | Nieużywane | `constants/theme.ts` |
| `store/auth.ts` | Redundantne z `store/app.ts` | `store/auth.ts` |
| `hooks/useExample.ts` | Demonstracyjny, nieużywany | `hooks/useExample.ts` |
| Sesja persystuje przez restart | Naprawione — `_layout.tsx` czeka na `onFinishHydration()` przed odczytem store | `app/_layout.tsx` |
| Zastąpienie `temp-UUID` prawdziwym Supabase UID | Niegotowe | `app/forms/dishes.tsx:72` |

