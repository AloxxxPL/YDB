# Services — Backend Integrations & Utilities

## Overview

The `services/` directory contains singleton instances and business logic for external API integrations:
- **Supabase** — PostgreSQL database + auth (planned)
- **Gemini AI** — Google Generative AI for meal plan generation
- **Custom REST API** — Dev/prod fallback for custom backend calls

All services are initialized once and exported as singletons. Each service is stateless and reusable across the app.

---

## `supabase.ts` — Database Client

### Initialization

```ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Configuration:** Read from `.env` file (client-safe keys only, no secrets).

**Mode:** Anononymous (unauthenticated) — suitable for Expo Go on iOS/Android.

### Used By

| File | Operation | Purpose |
|---|---|---|
| `app/forms/dishes.tsx` | `INSERT profiles` | Save completed user profile |
| (Future) `app/diet.tsx` | `INSERT diet_plans` | Archive generated meal plans |
| (Future) Auth flow | `auth.*` | Login / registration (not yet integrated) |

### Current Usage — Onboarding

In `dishes.tsx` `confirm()`:

```ts
const { error } = await supabase.from('profiles').insert([profileData]);
if (error) {
  Alert.alert('Error', 'Failed to save profile: ' + error.message);
  return;
}
```

**Error handling:** User is shown an alert if the insert fails; does not retry automatically.

---

## `gemini.ts` — AI Model Client

### Initialization

```ts
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(apiKey);
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite'
});
```

**Model:** `gemini-2.5-flash-lite` — Fast, lightweight variant optimized for mobile.

**Configuration:** Read from `.env` file.

### Used By

| File | Function | Purpose |
|---|---|---|
| `services/diet.ts` | `generateDietPlan()` | Generate initial 7-day meal plan |
| `services/diet.ts` | `refineDietPlan()` | Refine plan based on user feedback |
| `app/chat.tsx` | (Planned) Chat interface | Real-time conversation with AI nutritionist |

---

## `diet.ts` — Meal Plan Business Logic

### Overview

Encapsulates all Gemini AI prompts and response parsing. Two public async functions: generation and refinement.

### `generateDietPlan(profile: Profile): Promise<DietPlan>`

**Input:** User profile with name, age, gender, metrics, goals, favorite dishes.

**Process:**

1. **Language Detection:**
   - `getDeviceLanguage()` reads system locale (e.g., `'pl-PL'`) → extracts code → maps to language name
   - Maps to: Polish, English, German, French, Spanish, Italian, Portuguese, Russian, Ukrainian, Czech, Slovak, Dutch, Swedish, Norwegian, Danish, Finnish, Hungarian, Romanian, Turkish, Japanese, Chinese, Korean, Arabic
   - Fallback: `'English'` if locale unknown

2. **Prompt Building:**
   - Includes all profile data (name, age, gender, height, weight, goals, favorite dishes)
   - Instructs Gemini to:
     - Generate 7-day meal plan (Monday–Sunday)
     - Include breakfast, lunch, dinner, and 1–2 snacks per day
     - Use favorite dishes frequently
     - Align with user's goals
     - Include calorie/macro estimates
     - Write all output in user's device language
     - Return **raw JSON only** (no markdown)

3. **API Call:**
   ```ts
   const result = await geminiModel.generateContent(prompt);
   const responseText = result.response.text();
   ```

4. **Response Parsing:**
   - Extract JSON from response via regex: `/\{[\s\S]*\}/`
   - `JSON.parse()` to `DietPlan` type
   - Validate: `days` is array of exactly 7 elements
   - Throw error if validation fails

5. **Return:** Parsed `DietPlan` object

**Error Handling:**
- Catches and re-throws as `Error('Failed to generate diet plan: ...')`
- Called in `dishes.tsx` with `.then/.catch/.finally` (no await) — fires in background
- UI shows loading spinner while generating, error message if generation fails

**Network & API:** Calls Gemini API via `@google/generative-ai` SDK. Requires internet; no offline fallback.

---

### `refineDietPlan(profile: Profile, currentPlan: DietPlan, feedback: string): Promise<DietPlan>`

**Input:** User profile, current meal plan, user feedback text.

**Process:**

1. **Language Detection:** Same as `generateDietPlan()`

2. **Prompt Building:**
   - Includes user profile goals and favorite dishes
   - Summarizes current plan: `Day: Meal1, Meal2, ...`
   - Includes user feedback verbatim
   - New plan week number = `currentPlan.week + 1`
   - Requests JSON in same format as initial generation
   - Instructs Gemini to address all feedback points

3. **API Call & Parsing:** Identical to `generateDietPlan()`

4. **Validation:** Ensures 7 days

5. **Return:** New `DietPlan` with incremented `week` number

**Used By:** `diet.tsx` `submitFeedback()` — user provides feedback, function called, plan updated in store.

**UI Flow:**
```
User enters feedback
  → "Update Plan" button press
  → submitFeedback()
  ├─ setDietLoading(true)
  ├─ refineDietPlan()
  ├─ setDietPlan(refinedPlan)
  └─ setDietLoading(false) + success alert
```

---

## `api.ts` — REST API Helper

### Initialization

```ts
function getApiBase(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri; // e.g., "192.168.1.100:8081"
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:${process.env.EXPO_PUBLIC_PORT ?? '3000'}`;
    }
  }
  return process.env.EXPO_PUBLIC_API_URL ?? 'https://jsonplaceholder.typicode.com';
}

export const API_BASE = getApiBase();
```

**Purpose:** Dynamic endpoint resolution for dev vs. prod environments.

**Dev Mode (`__DEV__ === true`):**
- Expo provides LAN IP via `Constants.expoConfig.hostUri`
- Connects to local backend on that IP + configured port
- Allows testing custom backend without ngrok/tunneling

**Prod Mode / Fallback:**
- Uses `EXPO_PUBLIC_API_URL` from `.env` (e.g., `https://api.example.com`)
- If not set, falls back to `https://jsonplaceholder.typicode.com` (public testing API)

### `apiFetch<T>(path: string): Promise<T>`

**Usage:**
```ts
const posts = await apiFetch<Post[]>('/posts');
```

**Behavior:**
- Constructs full URL: `${API_BASE}${path}`
- Sends `fetch` request
- Checks `response.ok` — throws if status is not 2xx
- Parses and returns JSON

**Generic:** `<T>` allows type-safe responses (e.g., `apiFetch<Post[]>` infers return type).

### Used By

| File | Purpose |
|---|---|
| `hooks/useExample.ts` | Example TanStack Query hook using `apiFetch` |
| (Custom endpoints) | Any component calling custom backend endpoints |

---

## Environment Variables

| Variable | Scope | Example | Used By |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Client | `https://abc123.supabase.co` | `supabase.ts` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Client | `eyJ0eXAi...` (long key) | `supabase.ts` |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Client | `AIzaSy...` (Google API key) | `gemini.ts` |
| `EXPO_PUBLIC_API_URL` | Client | `https://api.example.com` | `api.ts` (prod fallback) |
| `EXPO_PUBLIC_PORT` | Client | `3000` | `api.ts` (dev port) |

**Prefix `EXPO_PUBLIC_`:** Baked into JS bundle by Expo — safe to read in frontend code. Never use for secrets.

---

## Error Handling Strategy

| Service | Error Pattern | Propagation |
|---|---|---|
| Supabase | `.error` field check → Alert | Synchronous in `dishes.tsx` |
| Gemini | `.catch()` → re-throw → Alert | Async in `dishes.tsx` (background) |
| API | Throw on non-OK status → caller handles | Caller (`apiFetch<T>` consumer) |

**Best Practice:** Always wrap service calls in try/catch or .catch() when called from UI.

