# Sources

## expo-image-picker — camera button
- https://docs.expo.dev/versions/latest/sdk/imagepicker/
- API: `ImagePicker.requestCameraPermissionsAsync()`, `ImagePicker.launchCameraAsync()`
- Package: `expo-image-picker` (installed via `npx expo install expo-image-picker`)

## @google/generative-ai — Gemini global access
- https://ai.google.dev/gemini-api/docs/quickstart?lang=node
- Package: `@google/generative-ai` (already in package.json)
- Model used: `gemini-1.5-flash`

## expo-router — nawigacja między ekranami
- https://docs.expo.dev/router/introduction/
- `useRouter().push('/diet')` — nawigacja do diet screena
- `useRouter().push('/journey')` — nawigacja do journey screena
- `useRouter().push('/profile')` — nawigacja do profile screena
- `useWindowDimensions()` — dynamiczna szerokość ekranu do skalowania komponentów

## Struktura nawigacji
- `app/_layout.tsx` — root Stack: `index`, `diet`, `journey`, `profile` + wszystkie ekrany `forms/*`
- `app/index.tsx` — ekran główny z Navbar (journey / kamera / profil) i przyciskiem diety;
  sprawdza `formsCompleted` w Zustand — jeśli false, renderuje `<Redirect href="/forms/name" />`
- `app/journey.tsx` — pusta strona Journey (Stack screen, ma back button)
- `app/profile.tsx` — pusta strona Profil (Stack screen, ma back button)
- `app/diet.tsx` — pusta strona Diety (Stack screen, ma back button)

## Formularze onboardingu (app/forms/)
Zbierają dane użytkownika w Zustand przed zapisaniem do Supabase.
Przepływ: `name → gender → age → height → weight → goal → dishes → Supabase → /` (home)

**Integracja z Zustand (tempProfile):**
- `app/forms/name.tsx` — przechowuje data.name w Zustand (`updateTempProfile`)
- `app/forms/gender.tsx` — przechowuje data.gender
- `app/forms/age.tsx` — przechowuje data.age (konwertuje na int)
- `app/forms/height.tsx` — przechowuje data.height_cm
- `app/forms/weight.tsx` — przechowuje data.weight_kg
- `app/forms/goal.tsx` — przechowuje data.goal, redirectuje do dishes
- `app/forms/dishes.tsx` — formularz do dodawania ulubionych dań (max 10):
  - ScrollView z listą kafelków - każdy ma [EDIT] i [REMOVE] buttony
  - Input + mały button do dodawania/edytowania dań
  - Button "Start" na dole wysyła wszystkie dane do Supabase
  - Wystarczy 1 danie by zakończyć formularz
  - Ustawia `formsCompleted = true` i `userId`, redirectuje do home

## Stan aplikacji — Zustand z persist
`store/app.ts` używa middleware `persist` z AsyncStorage:
- **token** — JWT lub identyfikator sesji (null dla temp users)
- **userId** — identyfikator użytkownika (temp UUID dla onboarding bez auth)
- **profile** — pełny profil z Supabase (Profile type)
- **tempProfile** — dane w trakcie formularzy (TempProfile type; rodzielone od profile)
- **formsCompleted** — czy formularze ukończone
- Wszystkie dane persisted → AsyncStorage → dostępne po restarcie aplikacji

## Bootstrap logika (app/_layout.tsx)
Na starcie aplikacji w `useEffect`:
1. Czyta token z AsyncStorage (via Zustand persist)
2. Jeśli brak tokena → `formsCompleted = false` (pokaż formularze)
3. Jeśli token istnieje → weryfikuj na Supabase (`auth.getSession()`)
4. Jeśli token invalid → wyloguj (clear token/profile)
5. Jeśli token valid → załaduj profil z `profiles` table → hydrate Zustand
6. Jeśli profil nie istnieje → `formsCompleted = false` (pokaż formularze)

## Zapisywanie profilu (app/forms/dishes.tsx)
Po dodaniu min. 1 dania i kliknięciu "Start":
1. Generuj temp UUID (`temp-{timestamp}-{random}`)
2. Przeanalizuj tempProfile z Zustand (name, gender, age, height_cm, weight_kg, goal, dishes)
3. Mapuj wybrany cel na typ ('lose' / 'muscle' / 'healthy')
4. Buduj obiekт Profile z wszystkimi polami
5. Wyślij `INSERT` do Supabase `profiles` table
6. Jeśli sukces → ustaw w Zustand (userId, profile, formsCompleted = true)
7. Redirect do `/` (home) — dashboard bez formularzy

## Restart aplikacji → Dashboard bez formularzy
1. Bootstrap ładuje AsyncStorage (persist)
2. Znajduje userId i token w Zustand
3. Weryfikuje profil na Supabase
4. Ustawia `formsCompleted = true`
5. `index.tsx` widzi flaga → `<Redirect href="/forms/name" />` nie pojawia się
6. Pokaż home/dashboard bezpośrednio

## Pakiety i konfiguracja
- `@supabase/supabase-js` — klient Supabase (services/supabase.ts)
- `@react-native-async-storage/async-storage` — pamięć na telefonie (mittorenie Zustand)
- `expo-secure-store` — bezpieczne przechowywanie sensitywnych danych
- `.env`: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Typy
- `types/supabase.ts` — `Profile` (id, name, gender, age, height_cm, weight_kg, goal, created_at)
- `types/index.ts` — `TempProfile` (opcjonalne pola), `AppStore` (Zustand interface)

## Redirect w Expo Router — ważna pułapka

### Problem: `useEffect` + `router.replace`
Pierwsza implementacja używała:
```ts
useEffect(() => {
  if (!formsCompleted) router.replace('/forms/name');
}, [formsCompleted]);
```
To powoduje błąd: **"Attempted to navigate before mounting the Root layout component"**

**Dlaczego:** `useEffect` odpala się po renderze, ale Expo Router wymaga żeby
root layout (`app/_layout.tsx`) był w pełni zamontowany zanim jakakolwiek
nawigacja zostanie wywołana. W pierwszym cyklu renderowania layout może jeszcze
nie być gotowy, więc `router.replace` trafia w pustkę i crashuje aplikację.

### Rozwiązanie: komponent `<Redirect>`
```tsx
if (!formsCompleted) return <Redirect href="/forms/name" />;
```
`<Redirect>` jest częścią drzewa renderowania — Expo Router obsługuje go
wewnętrznie i wykonuje nawigację dopiero gdy navigator jest gotowy.
Nie wymaga `useEffect` ani sprawdzania stanu nawigacji.

**Zasada:** w Expo Router zawsze używaj `<Redirect>` do warunkowego
przekierowania w komponencie. `router.replace/push` używaj tylko
w odpowiedzi na akcję użytkownika (onPress, callback itp.).

## NativeWind — Tailwind CSS na React Native
- https://www.nativewind.dev/
- `className="flex justify-between"` zamiast `StyleSheet`
- Niektóre wartości wymagają inline `style={{ width: 18 }}` dla dokładnych pixeli

## Expo environment variables
- https://docs.expo.dev/guides/environment-variables/
- Only `EXPO_PUBLIC_*` vars are exposed to the client bundle.
- `GEMINI_API_KEY` in `.env` must be renamed to `EXPO_PUBLIC_GEMINI_API_KEY` to work in the app.
