# React Native Bootstrap — Design Document

**Data:** 2026-03-03
**Status:** Zatwierdzony

---

## Cel

Bootstrapować aplikację mobilną React Native przygotowaną do dalszego rozwoju. Aplikacja ma działać na Android i iOS, uruchamiać się szybko na fizycznym telefonie przez Expo Go, oraz mieć solidną podstawę architektoniczną.

---

## Stack technologiczny

| Warstwa | Technologia |
|---------|------------|
| Framework | Expo SDK (managed workflow) |
| Routing | Expo Router (file-based) |
| Język | TypeScript |
| Stylowanie | NativeWind v4 (Tailwind CSS) |
| Stan globalny | Zustand |
| Dane z serwera | TanStack Query v5 |
| Platforma | Android + iOS |

---

## Struktura katalogów

```
YDB/
├── app/                    # Expo Router — trasy (ekrany)
│   ├── _layout.tsx         # Root layout (providers, fonts, QueryClient)
│   ├── index.tsx           # Ekran główny "/"
│   └── (tabs)/             # Group — nawigacja tab
│       ├── _layout.tsx
│       ├── home.tsx
│       └── profile.tsx
├── components/             # Wielokrotnego użytku UI
├── hooks/                  # Customowe hooki (useAuth, useProducts...)
├── store/                  # Zustand stores (auth.ts, ...)
├── services/               # API calls + query keys
├── types/                  # Typy TypeScript
├── constants/              # Kolory, rozmiary, theme.ts
├── assets/                 # Fonty, obrazki
├── tailwind.config.js
├── app.json
└── tsconfig.json
```

---

## Plan uruchomienia

### Wymagania

- Node.js 18+
- npm lub bun (aktualny)
- Expo Go zainstalowany na telefonie (App Store / Google Play)
- Opcjonalnie: Android Studio (emulator) lub Xcode (symulator iOS, tylko macOS)

### Bootstrap projektu

```bash
npx create-expo-app@latest YDB --template blank-typescript
cd YDB

# Expo Router i zależności nawigacji
npx expo install expo-router react-native-safe-area-context \
  react-native-screens react-native-gesture-handler expo-constants

# NativeWind, Zustand, TanStack Query
npm install nativewind zustand @tanstack/react-query
npm install -D tailwindcss

# Inicjalizacja Tailwind
npx tailwindcss init
```

### Uruchomienie dev server

```bash
npx expo start
```

### Uruchomienie na telefonie

**Opcja 1 — Expo Go (zalecana do developmentu):**
1. Zainstaluj Expo Go na telefonie
2. Zeskanuj QR code z terminala `npx expo start`
3. Hot reload działa natychmiast

**Opcja 2 — Development build (do native modules):**
```bash
npx expo run:android   # wymaga Android Studio / podłączonego telefonu
npx expo run:ios       # wymaga macOS + Xcode
```

---

## Konwencje kodu

- **Komponenty** — function components + hooks, brak klas
- **Nazewnictwo** — `PascalCase` dla komponentów, `camelCase` dla hooków
- **Zustand** — jeden plik per domain (`store/auth.ts`, `store/cart.ts`)
- **TanStack Query** — query keys jako stałe w `services/`, custom hooks opakowujące `useQuery`/`useMutation`
- **NativeWind** — klasy Tailwind w JSX, wspólne warianty w `constants/theme.ts`
- **Commity** — `feat:`, `fix:`, `chore:`, `docs:`

## Narzędzia jakości

```bash
npx expo lint      # ESLint + Prettier (skonfigurowane przez Expo)
npx tsc --noEmit   # TypeScript check
```

---

## Gotowość pod rozszerzenie

Projekt przygotowany strukturalnie na:
- Autentykację (Zustand store `auth` z miejscem na token/session)
- Połączenie z API (service layer + interceptory)
- Push notifications (Expo Notifications — wymaga dev build)
- Testy (Jest + React Native Testing Library)
