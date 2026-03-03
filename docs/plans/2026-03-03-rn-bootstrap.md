# React Native Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrapować aplikację mobilną React Native (Expo + TypeScript) z file-based routing, NativeWind, Zustand i TanStack Query, gotową do uruchomienia na fizycznym telefonie przez Expo Go.

**Architecture:** Expo managed workflow z Expo Router jako warstwą nawigacji (file-based, jak Next.js). Root layout `app/_layout.tsx` zawiera wszystkich providerów (QueryClient, NativeWind). Zustand stores trzymają stan globalny, TanStack Query obsługuje dane z serwera.

**Tech Stack:** Expo SDK 51+, Expo Router v3, TypeScript 5, NativeWind v4, Zustand v5, TanStack Query v5, React Native 0.74+

---

## Przed rozpoczęciem

Upewnij się, że masz:
- Node.js 18+ (`node --version`)
- npm 9+ lub bun (`npm --version`)
- Expo Go zainstalowane na telefonie (App Store / Google Play)
- Działające połączenie sieciowe (telefon i komputer muszą być w tej samej sieci Wi-Fi)

Katalog roboczy: `/home/aloxxx/Workspace/YDB`

---

### Task 1: Inicjalizacja projektu Expo

**Files:**
- Create: `/home/aloxxx/Workspace/YDB/` (cały projekt)

**Step 1: Wejdź do katalogu roboczego**

```bash
cd /home/aloxxx/Workspace/YDB
```

**Step 2: Utwórz projekt Expo z szablonem TypeScript**

```bash
npx create-expo-app@latest . --template blank-typescript
```

Kiedy zostaniesz zapytany o nazwę projektu — wpisz `YDB`.
Jeśli pyta o nadpisanie katalogu (jest już `.claude/`) — wybierz tak.

Expected output: `✅ Your project is ready!`

**Step 3: Zweryfikuj strukturę**

```bash
ls -la
```

Expected: widoczne pliki `App.tsx`, `app.json`, `tsconfig.json`, `package.json`.

**Step 4: Uruchom dev server żeby sprawdzić że projekt działa**

```bash
npx expo start
```

Powinieneś zobaczyć QR kod w terminalu. Naciśnij `q` żeby wyjść.

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: init expo typescript project"
```

---

### Task 2: Instalacja i konfiguracja Expo Router

**Files:**
- Modify: `app.json`
- Modify: `package.json` (entry point)
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`
- Delete: `App.tsx` (zastąpiony przez Expo Router)

**Step 1: Zainstaluj Expo Router i wymagane zależności**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  react-native-gesture-handler expo-constants expo-linking expo-status-bar
```

Expected: instalacja bez błędów, aktualizacja `package.json`.

**Step 2: Zmień entry point w `package.json`**

Otwórz `package.json` i zmień pole `main`:

```json
{
  "main": "expo-router/entry"
}
```

**Step 3: Skonfiguruj scheme w `app.json`**

Dodaj `scheme` i `web.bundler` do `app.json`:

```json
{
  "expo": {
    "name": "YDB",
    "slug": "ydb",
    "scheme": "ydb",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Step 4: Usuń stary `App.tsx`**

```bash
rm App.tsx
```

**Step 5: Utwórz `app/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
```

**Step 6: Utwórz `app/index.tsx`**

```tsx
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>YDB — działa!</Text>
    </View>
  );
}
```

**Step 7: Zweryfikuj że Expo Router działa**

```bash
npx expo start
```

Zeskanuj QR kod telefonem z Expo Go. Powinieneś zobaczyć ekran "YDB — działa!". Naciśnij `q` żeby wyjść.

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add expo-router with root layout and index screen"
```

---

### Task 3: Konfiguracja NativeWind v4

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Modify: `app/_layout.tsx`
- Modify: `babel.config.js`
- Modify: `metro.config.js` (nowy plik)

**Step 1: Zainstaluj NativeWind i Tailwind**

```bash
npm install nativewind@^4.0.1
npm install --save-dev tailwindcss@3.3.2
```

**Step 2: Utwórz `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Step 3: Utwórz `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Zaktualizuj `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

**Step 5: Utwórz `metro.config.js`**

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

**Step 6: Zaktualizuj `app/_layout.tsx` — dodaj import CSS**

```tsx
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
```

**Step 7: Przetestuj NativeWind — zaktualizuj `app/index.tsx`**

```tsx
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-blue-600">YDB — NativeWind działa!</Text>
    </View>
  );
}
```

**Step 8: Uruchom i sprawdź na telefonie**

```bash
npx expo start --clear
```

Tekst powinien być niebieski i duży. Jeśli tak — NativeWind działa.

**Step 9: Commit**

```bash
git add .
git commit -m "feat: configure nativewind v4 with tailwind"
```

---

### Task 4: Konfiguracja Zustand

**Files:**
- Create: `store/app.ts`
- Create: `types/index.ts`

**Step 1: Zainstaluj Zustand**

```bash
npm install zustand
```

**Step 2: Utwórz `types/index.ts`**

```ts
// Globalne typy aplikacji
export type AppStore = {
  isReady: boolean;
  setReady: (ready: boolean) => void;
};
```

**Step 3: Utwórz `store/app.ts`**

```ts
import { create } from 'zustand';
import type { AppStore } from '../types';

export const useAppStore = create<AppStore>((set) => ({
  isReady: false,
  setReady: (ready) => set({ isReady: ready }),
}));
```

**Step 4: Przetestuj store — zaktualizuj `app/index.tsx`**

```tsx
import { Text, View } from 'react-native';
import { useAppStore } from '../store/app';

export default function Index() {
  const { isReady, setReady } = useAppStore();

  return (
    <View className="flex-1 justify-center items-center bg-white gap-4">
      <Text className="text-2xl font-bold text-blue-600">YDB</Text>
      <Text className="text-gray-600">isReady: {String(isReady)}</Text>
      <Text
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        onPress={() => setReady(!isReady)}
      >
        Toggle Ready
      </Text>
    </View>
  );
}
```

**Step 5: Sprawdź na telefonie**

```bash
npx expo start
```

Naciśnij "Toggle Ready" — wartość `isReady` powinna się zmieniać.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add zustand store with app state"
```

---

### Task 5: Konfiguracja TanStack Query

**Files:**
- Modify: `app/_layout.tsx`
- Create: `services/api.ts`
- Create: `hooks/useExample.ts`

**Step 1: Zainstaluj TanStack Query**

```bash
npm install @tanstack/react-query
```

**Step 2: Zaktualizuj `app/_layout.tsx` — dodaj QueryClientProvider**

```tsx
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minut
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
```

**Step 3: Utwórz `services/api.ts`**

```ts
// Bazowa konfiguracja API — rozszerz o właściwy base URL
export const API_BASE = 'https://jsonplaceholder.typicode.com';

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
```

**Step 4: Utwórz `hooks/useExample.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

type Post = {
  id: number;
  title: string;
  body: string;
};

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiFetch<Post[]>('/posts?_limit=5'),
  });
}
```

**Step 5: Przetestuj w `app/index.tsx`**

```tsx
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { usePosts } from '../hooks/useExample';

export default function Index() {
  const { data, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Błąd: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      <Text className="text-2xl font-bold text-center mb-4">YDB</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 p-4 bg-gray-50 rounded-xl">
            <Text className="font-semibold text-gray-800">{item.title}</Text>
            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

**Step 6: Sprawdź na telefonie**

```bash
npx expo start
```

Powinieneś zobaczyć listę postów załadowanych z API.

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add tanstack query with queryClient provider and example hook"
```

---

### Task 6: Struktury katalogów i pliki placeholder

**Files:**
- Create: `components/.gitkeep`
- Create: `constants/theme.ts`
- Create: `store/auth.ts`

**Step 1: Utwórz placeholder dla komponentów**

```bash
mkdir -p components
touch components/.gitkeep
```

**Step 2: Utwórz `constants/theme.ts`**

```ts
// Wspólne wartości designu — rozszerzaj w miarę potrzeb
export const colors = {
  primary: '#3B82F6',    // blue-500
  secondary: '#6B7280',  // gray-500
  background: '#FFFFFF',
  surface: '#F9FAFB',    // gray-50
  error: '#EF4444',      // red-500
  text: {
    primary: '#111827',   // gray-900
    secondary: '#6B7280', // gray-500
    inverse: '#FFFFFF',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
```

**Step 3: Utwórz `store/auth.ts`** (placeholder pod autentykację)

```ts
import { create } from 'zustand';

type AuthState = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: true }),
  clearAuth: () => set({ token: null, userId: null, isAuthenticated: false }),
}));
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: add constants/theme, auth store placeholder, components dir"
```

---

### Task 7: Nawigacja tab (Expo Router groups)

**Files:**
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/home.tsx`
- Create: `app/(tabs)/profile.tsx`
- Modify: `app/index.tsx` — redirect do tabs

**Step 1: Utwórz `app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
        }}
      />
    </Tabs>
  );
}
```

**Step 2: Utwórz `app/(tabs)/home.tsx`**

```tsx
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { usePosts } from '../../hooks/useExample';

export default function HomeScreen() {
  const { data, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Błąd: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 px-4 pb-4">
        <Text className="text-3xl font-bold text-gray-900">YDB</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="px-4 pb-8"
        renderItem={({ item }) => (
          <View className="mb-3 p-4 bg-gray-50 rounded-xl">
            <Text className="font-semibold text-gray-800">{item.title}</Text>
            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

**Step 3: Utwórz `app/(tabs)/profile.tsx`**

```tsx
import { Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Profil</Text>
      <Text className="text-gray-500 mt-2">Ekran profilu — do uzupełnienia</Text>
    </View>
  );
}
```

**Step 4: Zaktualizuj `app/index.tsx` — redirect do tabs**

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
```

**Step 5: Sprawdź na telefonie**

```bash
npx expo start --clear
```

Powinieneś widzieć aplikację z dolną nawigacją tab: Home i Profil.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add tabs navigation with home and profile screens"
```

---

### Task 8: Weryfikacja końcowa i .gitignore

**Files:**
- Modify: `.gitignore`

**Step 1: Sprawdź `.gitignore`**

Expo powinien był wygenerować `.gitignore`. Upewnij się, że zawiera:

```
node_modules/
.expo/
dist/
web-build/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
```

Jeśli czegoś brakuje, dodaj ręcznie.

**Step 2: Sprawdź TypeScript**

```bash
npx tsc --noEmit
```

Expected: brak błędów.

**Step 3: Sprawdź lint**

```bash
npx expo lint
```

Expected: brak błędów lub tylko ostrzeżenia.

**Step 4: Finalne sprawdzenie na telefonie**

```bash
npx expo start --clear
```

Zweryfikuj:
- [ ] Aplikacja uruchamia się i pokazuje ekran Home z listą postów
- [ ] Tab "Profil" działa
- [ ] NativeWind (Tailwind klasy) działa — tekst ma właściwe kolory/rozmiary
- [ ] Hot reload działa po edycji pliku

**Step 5: Commit finalny**

```bash
git add .
git commit -m "chore: final bootstrap — all features verified"
```

---

## Struktura po zakończeniu

```
YDB/
├── app/
│   ├── _layout.tsx          # Root layout z QueryClient
│   ├── index.tsx            # Redirect → (tabs)/home
│   └── (tabs)/
│       ├── _layout.tsx      # Tabs navigator
│       ├── home.tsx         # Home screen z TanStack Query
│       └── profile.tsx      # Profile screen
├── components/              # Wielokrotnego użytku (gotowe na rozbudowę)
├── constants/
│   └── theme.ts             # Kolory, spacing
├── docs/
│   └── plans/               # Dokumenty designu i planów
├── hooks/
│   └── useExample.ts        # Przykładowy hook z TanStack Query
├── services/
│   └── api.ts               # Bazowe fetch + API_BASE
├── store/
│   ├── app.ts               # Stan aplikacji
│   └── auth.ts              # Placeholder autentykacji
├── types/
│   └── index.ts             # Globalne typy
├── global.css               # Tailwind imports
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
├── app.json
└── tsconfig.json
```

---

## Uruchomienie po bootstrapie

```bash
# Dev server (Expo Go na telefonie)
npx expo start

# Wyczyść cache jeśli coś nie działa
npx expo start --clear

# TypeScript check
npx tsc --noEmit

# Lint
npx expo lint
```
