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
Zbierają dane użytkownika przed pierwszym wejściem do aplikacji.
Przepływ: `name → gender → age → height → weight → goal → /` (home)

- `app/forms/name.tsx` — TextInput na imię; przycisk Continue aktywny gdy pole niepuste
- `app/forms/gender.tsx` — dwa przyciski Male / Female; tap auto-przechodzi do age
- `app/forms/age.tsx` — TextInput numeric (lata); przycisk Continue
- `app/forms/height.tsx` — TextInput numeric (cm); przycisk Continue
- `app/forms/weight.tsx` — TextInput numeric (kg); przycisk Continue
- `app/forms/goal.tsx` — trzy opcje (Drop few pounds / Gain muscle tissue / Create healthier habits);
  tap ustawia `formsCompleted = true` w Zustand i robi `router.replace('/')`

## Stan onboardingu (store/app.ts)
- `formsCompleted: boolean` — flaga czy użytkownik przeszedł formularze
- `setFormsCompleted(boolean)` — setter
- Tymczasowo in-memory (gubi się przy restarcie)
- TODO: zastąpić sprawdzeniem profilu w Supabase (patrz `docs/supabase-architecture.md`)

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
