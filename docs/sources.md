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
- `useRouter().push('/diet')` — nawigacja do Stack screena poza zakładkami
- `useRouter().push('/(tabs)/journey')` — nawigacja do ekranu w grupie tabs
- `useWindowDimensions()` — dynamiczna szerokość ekranu do skalowania komponentów

## Struktura nawigacji
- `app/_layout.tsx` — root Stack: `(tabs)`, `diet`
- `app/(tabs)/_layout.tsx` — custom Navbar (journey / kamera / profil), Tabs: `home`, `journey`, `profile`
- `app/(tabs)/home.tsx` — ekran główny z przyciskiem diety
- `app/(tabs)/journey.tsx` — pusta strona Journey
- `app/(tabs)/profile.tsx` — pusta strona Profil
- `app/diet.tsx` — pusta strona Diety (Stack screen, ma back button)

## Expo environment variables
- https://docs.expo.dev/guides/environment-variables/
- Only `EXPO_PUBLIC_*` vars are exposed to the client bundle.
- `GEMINI_API_KEY` in `.env` must be renamed to `EXPO_PUBLIC_GEMINI_API_KEY` to work in the app.
