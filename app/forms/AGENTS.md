# Forms — Onboarding Flow

## Overview

The `app/forms/` directory implements a **7-step linear onboarding wizard**.
Each step collects one piece of user data, writes it to `tempProfile` in the Zustand store (`useAppStore`), then navigates to the next step.
No step validates data from a previous step — each form is independent and reads only its own slice from `tempProfile`.

The flow is guarded at the app entry point: `app/index.tsx` redirects to `/forms/name` when `formsCompleted === false`.

---

## Navigation Chain

```
/forms/name → /forms/gender → /forms/age → /forms/height → /forms/weight → /forms/goal → /forms/dishes → / (replace)
```

All screens have `headerShown: false` — navigation is fully custom (Continue buttons / selection triggers).

---

## Step-by-Step Reference

### Step 1 — `name.tsx` (`/forms/name`)

**Purpose:** Collect user's name.

**State:** `useState<string>` initialized from `tempProfile.name` (resume-safe).

**Validation:** `canContinue = name.trim().length > 0` — Continue button is disabled until non-empty.

**Store write:** `updateTempProfile({ name })` on Continue press.

**Navigation:** `router.push('/forms/gender')`

---

### Step 2 — `gender.tsx` (`/forms/gender`)

**Purpose:** Select biological gender.

**State:** No local state — selection is immediate.

**UI:** Two large tile buttons: `Male` / `Female`.

**Store write + navigation:** Single `selectGender(gender)` function calls `updateTempProfile({ gender })` then `router.push('/forms/age')` — no separate confirmation step.

**Type:** `'male' | 'female'`

---

### Step 3 — `age.tsx` (`/forms/age`)

**Purpose:** Collect user's age in years.

**State:** `useState<string>` initialized from `tempProfile.age?.toString()`.

**Input:** `keyboardType="numeric"`, autoFocus.

**Validation:** `canContinue = age.trim().length > 0` — no range check.

**Store write:** `updateTempProfile({ age: parseInt(age, 10) })` on Continue.

**Navigation:** `router.push('/forms/height')`

---

### Step 4 — `height.tsx` (`/forms/height`)

**Purpose:** Collect user's height in centimetres.

**State:** `useState<string>` initialized from `tempProfile.height_cm?.toString()`.

**Input:** `keyboardType="numeric"`, placeholder `"cm"`, autoFocus.

**Validation:** `canContinue = height.trim().length > 0` — no range check.

**Store write:** `updateTempProfile({ height_cm: parseInt(height, 10) })` on Continue.

**Navigation:** `router.push('/forms/weight')`

---

### Step 5 — `weight.tsx` (`/forms/weight`)

**Purpose:** Collect user's weight in kilograms.

**State:** `useState<string>` initialized from `tempProfile.weight_kg?.toString()`.

**Input:** `keyboardType="numeric"`, placeholder `"kg"`, autoFocus.

**Validation:** `canContinue = weight.trim().length > 0` — no range check.

**Store write:** `updateTempProfile({ weight_kg: parseFloat(weight) })` on Continue.
Note: uses `parseFloat` (not `parseInt`) to allow decimal values.

**Navigation:** `router.push('/forms/goal')`

---

### Step 6 — `goal.tsx` (`/forms/goal`)

**Purpose:** Select one or more fitness goals.

**State:** `useState<string[]>([])` — list of selected display labels.

**Options (display label → internal key):**

| Display | Stored as |
|---|---|
| Drop few pounds | `'lose'` |
| Gain muscle tissue | `'muscle'` |
| Create healthier habits | `'healthy'` |

**Interaction:** `toggle(goal)` adds/removes from the local array. Multi-select is allowed.

**Validation:** `selected.length === 0` → `confirm()` returns early; Continue button is disabled.

**Business logic in `confirm()`:**
1. Guards empty selection.
2. Maps display labels to typed keys via `goalMap` record.
3. Filters `Boolean` to strip any unmapped values (safety net).
4. Calls `updateTempProfile({ goal: goals })`.
5. Navigates to `/forms/dishes`.

**Type:** `('lose' | 'muscle' | 'healthy')[]`

---

### Step 7 — `dishes.tsx` (`/forms/dishes`) — **Final step**

**Purpose:** Collect favourite dishes, save the full profile, trigger diet generation, complete onboarding.

**State:**
- `input: string` — current text field value.
- `dishes: string[]` — list of dishes, initialized from `tempProfile.dishes`.
- `editingIndex: number | null` — which dish is being edited (`null` = add mode).
- `editingRef: RefObject<number | null>` — ref mirror of `editingIndex` used inside callbacks to avoid stale closure.
- `isLoading: boolean` — blocks UI during async operations.

**Dish management:**

| Function | Behaviour |
|---|---|
| `addDish()` | In add mode: appends trimmed input (max 10); in edit mode: replaces item at `editingRef.current` |
| `startEdit(index)` | Sets `editingIndex` + `editingRef`, copies dish text to input |
| `removeDish(index)` | Filters out dish; resets editing state if editing that index |

**Limit:** Maximum 10 dishes — `Alert` shown if exceeded.

**`confirm()` — main submission flow:**

```
1. Guard: dishes.length === 0 → Alert, return
2. Guard: isLoading → return (prevents double-submit)
3. setIsLoading(true)
4. Generate tempUserId = `temp-${Date.now()}-${Math.random().toString(36)}`
5. Build profileData from tempProfile fields (with fallback defaults)
6. supabase.from('profiles').insert([profileData])
   └─ on error → Alert, setIsLoading(false), return
7. updateTempProfile({ dishes })
8. setUserId(tempUserId)
9. setProfile(profileData)
10. setFormsCompleted(true)   ← unlocks the gate in index.tsx
11. setDietLoading(true)
12. setDietError(null)
13. generateDietPlan(profileData)  ← fired in background (no await)
    ├─ .then  → setDietPlan(plan)
    ├─ .catch → setDietError(err.message)
    └─ .finally → setDietLoading(false)
14. router.replace('/')   ← immediate redirect, diet generates asynchronously
```

**Fallback defaults applied when building `profileData`:**

| Field | Fallback |
|---|---|
| `name` | `'User'` |
| `gender` | `'male'` |
| `age` | `25` |
| `height_cm` | `170` |
| `weight_kg` | `70` |

**Services used:**
- `services/supabase.ts` — direct Supabase client for `profiles` INSERT
- `services/diet.ts` → `generateDietPlan()` — calls Gemini AI

---

## Store Contract

All forms write exclusively via `updateTempProfile(partial: Partial<TempProfile>)`.
This is a **shallow merge** — each step only overwrites its own field.

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

Steps 1, 3, 4, 5 pre-populate local state from `tempProfile` — re-entering a form preserves previously entered values.
Steps 2 and 6 do **not** pre-populate (no saved selection rendered on re-entry).

---

## Data Flow Diagram

```
name.tsx      → updateTempProfile({ name })
gender.tsx    → updateTempProfile({ gender })
age.tsx       → updateTempProfile({ age })
height.tsx    → updateTempProfile({ height_cm })
weight.tsx    → updateTempProfile({ weight_kg })
goal.tsx      → updateTempProfile({ goal })
                                                   ┐
dishes.tsx    → updateTempProfile({ dishes })      │
              → supabase INSERT profiles           │  confirm()
              → setProfile / setUserId             │
              → setFormsCompleted(true)            │
              → generateDietPlan() [background]    │
              → router.replace('/')                ┘
```

---

## Known Gaps / TODO

- No numeric range validation on age, height, weight (any positive integer passes).
- `gender.tsx` does not pre-populate a previously selected value — re-entry always shows unselected state.
- `goal.tsx` does not pre-populate from `tempProfile.goal` — same issue.
- `tempUserId` is a client-generated random string, not a real Supabase auth UUID. Auth integration is planned but not yet implemented.
- Back navigation is not handled — pressing the hardware back button would allow skipping steps without saving.
