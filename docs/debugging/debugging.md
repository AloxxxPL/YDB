# Fix: Brak połączenia z aplikacją na fizycznym telefonie

## Problem

Po uruchomieniu `expo start` aplikacja ładowała się na telefonie, ale od razu wyświetlała ekran błędu:

```
Błąd: [network error / API error]
```

## Przyczyna

W `services/api.ts` zmieniono `API_BASE` z hardcodowanego JSONPlaceholder na dynamiczną funkcję `getApiBase()`, która próbuje wykryć IP maszyny deweloperskiej przez `Constants.expoConfig?.hostUri`.

**Dwa problemy:**

1. **Brak lokalnego serwera API** — kod budował URL `http://<ip>:3000`, ale na porcie 3000 nie działał żaden serwer. Każde zapytanie kończyło się błędem sieci.

2. **Zepsuty fallback** — gdy `hostUri` był niedostępny (lub serwer na porcie 3000 nie odpowiadał), fallback wskazywał na `'https://your-production-api.com'` — placeholder, który nie istnieje.

```typescript
// PRZED naprawą — zepsuty fallback:
return process.env.EXPO_PUBLIC_API_URL ?? 'https://your-production-api.com';
```

## Naprawa

Zmieniono fallback na `https://jsonplaceholder.typicode.com` — publiczne mock API, dla którego projekt był pierwotnie skonfigurowany (hook `usePosts` woła `/posts?_limit=5`).

```typescript
// PO naprawie — działający fallback:
return process.env.EXPO_PUBLIC_API_URL ?? 'https://jsonplaceholder.typicode.com';
```

**Plik**: `services/api.ts`

## Zachowanie po naprawie

| Środowisko | `hostUri` dostępny | Wynik |
|---|---|---|
| Dev + lokalny serwer na :3000 | tak | `http://<ip>:3000` |
| Dev + brak lokalnego serwera | tak/nie | JSONPlaceholder (fallback) |
| Produkcja z `EXPO_PUBLIC_API_URL` | n/d | wartość z `.env` |
| Produkcja bez `EXPO_PUBLIC_API_URL` | n/d | JSONPlaceholder (fallback) |

## Aby używać własnego lokalnego API

Ustaw `EXPO_PUBLIC_API_URL` w `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Lub uruchom `expo start` i upewnij się, że lokalny serwer działa na porcie ustawionym w `EXPO_PUBLIC_PORT`.
