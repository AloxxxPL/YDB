# Downgrade Expo SDK 55 → SDK 54

**Data:** 2026-03-26
**Commit:** `d66e252`

---

## Problem

Aplikacja uruchomiona przez Expo Go na starszym iPhonie nie ładowała się. Expo Go na fizycznym telefonie wspiera tylko konkretne wersje SDK — wersja zainstalowana na telefonie nie obsługiwała SDK 55.

**Symptom:** Skanowanie QR kodu kończyło się ekranem błędu lub brakiem odpowiedzi.

---

## Przyczyna

Projekt został zbootstrapowany z `create-expo-app` na SDK 55 (`expo: ~55.0.4`, `react-native: 0.83.2`). Expo Go na starszym iPhonie obsługiwał jedynie SDK 54.

---

## Podjęte czynności

### 1. Zmiana wersji w `package.json`

Ręczna aktualizacja wszystkich zależności powiązanych z SDK na wersje kompatybilne z SDK 54:

| Pakiet | SDK 55 | SDK 54 |
|--------|--------|--------|
| `expo` | `~55.0.4` | `~54.0.0` |
| `expo-router` | `~55.0.3` | `~6.0.0` |
| `expo-constants` | `~55.0.7` | `~18.0.0` |
| `expo-linking` | `~55.0.7` | `~8.0.0` |
| `expo-status-bar` | `~55.0.4` | `~3.0.0` |
| `react` | `19.2.0` | `19.1.0` |
| `react-native` | `0.83.2` | `0.81.5` |
| `react-native-gesture-handler` | `~2.30.0` | `~2.28.0` |
| `react-native-safe-area-context` | `~5.6.2` | `~5.6.0` |
| `react-native-screens` | `~4.23.0` | `~4.16.0` |
| `eslint-config-expo` | `~55.0.0` | `~10.0.0` |
| `tailwindcss` | `^3.3.2` | `^3.4.19` |
| `@types/react` | `~19.2.2` | `~19.1.0` |

Przy tej samej okazji dodano nowe zależności:

| Pakiet | Wersja | Cel |
|--------|--------|-----|
| `@expo/ngrok` | `^4.1.0` | Tunelowanie (alternatywa dla LAN) |
| `@google/generative-ai` | `^0.24.1` | Gemini AI SDK |
| `expo-image-picker` | `~17.0.10` | Dostęp do aparatu i galerii |
| `react-dom` | `19.1.0` | Wymagane przez Expo SDK 54 + web |

### 2. Reinstalacja node_modules

```bash
rm -rf node_modules package-lock.json
npm install
```

Wygenerowano nowy `package-lock.json` odpowiadający SDK 54.

### 3. Weryfikacja działania

```bash
npx expo start
```

Aplikacja załadowała się poprawnie przez Expo Go na fizycznym iPhonie po zeskanowaniu QR kodu.

---

## Powiązany problem: zepsuty fallback w `services/api.ts`

Po podłączeniu telefonu do sieci wykryto dodatkowy błąd — niezależny od wersji SDK.

**Data naprawy:** 2026-03-23

### Problem

W `services/api.ts` fallback URL wskazywał na placeholder `'https://your-production-api.com'`, który nie istnieje:

```typescript
// PRZED — zepsuty fallback:
return process.env.EXPO_PUBLIC_API_URL ?? 'https://your-production-api.com';
```

Gdy telefon nie mógł się połączyć z lokalnym serwerem dev (port 3000), fallback kończył się błędem sieciowym.

### Naprawa

Fallback zmieniony na `https://jsonplaceholder.typicode.com` — publiczne mock API, zgodne z istniejącym hookiem `usePosts` (`/posts?_limit=5`):

```typescript
// PO naprawie — działający fallback:
return process.env.EXPO_PUBLIC_API_URL ?? 'https://jsonplaceholder.typicode.com';
```

**Plik:** `services/api.ts:13`

### Zachowanie `getApiBase()` po naprawie

| Środowisko | `hostUri` dostępny | Wynik |
|---|---|---|
| Dev + lokalny serwer na `:3000` | tak | `http://<ip>:3000` |
| Dev + brak lokalnego serwera | tak/nie | JSONPlaceholder (fallback) |
| Produkcja z `EXPO_PUBLIC_API_URL` | n/d | wartość z `.env` |
| Produkcja bez `EXPO_PUBLIC_API_URL` | n/d | JSONPlaceholder (fallback) |

---

## Uwagi

- Expo Go zawsze obsługuje **tylko dwie ostatnie wersje SDK** — przy kolejnym bootstrapie sprawdzić wersję na telefonie przed wyborem SDK.
- Wersje SDK i ich kompatybilnych pakietów: https://docs.expo.dev/versions/latest/
- Aby sprawdzić wersję SDK obsługiwaną przez zainstalowane Expo Go: otworzyć aplikację → Settings → SDK version.
