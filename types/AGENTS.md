# Types — TypeScript Type Definitions

## Overview

The `types/` directory exports all TypeScript interfaces and types used across the app. Types are organized into two files: `index.ts` (app-specific types) and `supabase.ts` (database schema types).

---

## `index.ts` — Frontend Types

### `TempProfile` — Onboarding Accumulator

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

**Purpose:** Collect user input during the 7-step onboarding flow, accumulated in `useAppStore.tempProfile`.

**Lifecycle:**
- Initialized as `{}` at app boot
- Each form step: `updateTempProfile({ fieldName: value })`
- After onboarding complete: `formsCompleted = true`, `tempProfile` persists in AsyncStorage as a historical record

**Note:** All fields are optional (`?`) to allow partial form progression.

---

### `DietPlan` — Frontend Diet Structure

```ts
type DietPlan = {
  week: number;
  days: Array<{
    day: string; // "Monday", "Tuesday", etc.
    meals: Array<{
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      name: string;
      description: string; // includes calories/macros
    }>;
  }>;
  notes: string; // general nutrition tips
};
```

**Purpose:** Parse and render the AI-generated meal plan in the UI.

**Source:** Returned by `generateDietPlan()` in `services/diet.ts` — parses Gemini API response.

**Validation:** Must have exactly 7 days (one per weekday).

**Mutation:** Refined via `refineDietPlan()` when user provides feedback in `diet.tsx`.

---

### `AppStore` — Zustand State Interface

```ts
type AppStore = {
  isReady: boolean;
  setReady: (ready: boolean) => void;

  token: string | null;
  setToken: (token: string | null) => void;

  userId: string | null;
  setUserId: (userId: string | null) => void;

  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;

  tempProfile: TempProfile;
  setTempProfile: (tempProfile: TempProfile) => void;
  updateTempProfile: (partial: Partial<TempProfile>) => void;

  formsCompleted: boolean;
  setFormsCompleted: (completed: boolean) => void;

  dietPlan: DietPlan | null;
  setDietPlan: (plan: DietPlan | null) => void;

  dietLoading: boolean;
  setDietLoading: (loading: boolean) => void;

  dietError: string | null;
  setDietError: (error: string | null) => void;
};
```

**Purpose:** Type for `useAppStore` hook; defines all state fields and actions.

**Used by:** All components importing `useAppStore` for type safety.

---

## `supabase.ts` — Database Schema Types

### `Profile` — User Profile Table

```ts
type Profile = {
  id: string;              // Primary key = auth.users.id (currently temp UUID)
  name: string;
  gender: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_kg: number;
  goal: ('lose' | 'muscle' | 'healthy')[]; // Array of goals
  dishes: string[];        // Favorite dishes (JSON array in DB)
  created_at: string;      // ISO timestamp
};
```

**Purpose:** Schema for `profiles` table in Supabase.

**Lifecycle:**
1. User completes onboarding in `dishes.tsx`
2. Profile object built from `tempProfile` + defaults
3. Inserted into Supabase via `supabase.from('profiles').insert([profileData])`
4. Fetched back (if implemented) and cached in `useAppStore.profile`

**Note:** `id` is currently a client-generated temp UUID (e.g., `temp-1234567890-abc123`). Real auth integration will replace with Supabase `auth.users.id`.

---

### `DietPlan` (Supabase) — Diet Plans Table

```ts
type DietPlan = {
  id: string;
  user_id: string;         // Foreign key → profiles.id
  plan_json: Record<string, any>; // Full plan stored as JSON
  generated_at: string;    // ISO timestamp
  is_active: boolean;      // Whether this is the current active plan
};
```

**Purpose:** Schema for `diet_plans` table in Supabase (planned but not yet integrated).

**Current Status:** Generated plans are stored only in Zustand/AsyncStorage. Database schema defined but not yet used in the app.

**Future use:** After diet generation, plans could be persisted to this table for history and multi-device sync.

---

## Naming Conflicts & Aliases

**`DietPlan` appears in both files:**

- **`types/index.ts`:** Frontend render structure (UI format)
  ```ts
  import type { DietPlan } from '../types';
  ```

- **`types/supabase.ts`:** Supabase table schema (storage format)
  ```ts
  import type { DietPlan as DietPlanDB } from './supabase';
  ```

**In `services/diet.ts`:** Uses alias to distinguish:
```ts
import type { DietPlan } from '../types';              // Frontend
import type { Profile } from '../types/supabase';     // DB schema
```

---

## Extension Points

If adding new features, extend types here:

| Feature | Type to extend |
|---|---|
| Grocery list | Add `shoppingList?: string[]` to `TempProfile` |
| Allergies | Add `allergies?: string[]` to `Profile` |
| Multiple profiles | Create `User` type with `Profile[]` array |
| Meal history | Create new `MealLog` type and Supabase schema |

