# App — Main Screens & Navigation

## Overview

The `app/` directory contains the main screens (pages) of the application. All screens use **expo-router** file-based routing and are organized hierarchically:

- **Root screens:** Direct children of `app/` (e.g., `index.tsx`, `diet.tsx`)
- **Forms (onboarding):** Nested in `app/forms/` — describes in separate `AGENTS.md`

All screens have `headerShown: false` — navigation is entirely custom (back buttons, navbar, etc.).

---

## `_layout.tsx` — Root Layout

### Purpose

Global layout wrapper and initialization logic for the entire app.

### What It Does

1. **Imports global CSS:**
   ```ts
   import '../global.css';  // Tailwind/NativeWind styles
   ```

2. **Initializes TanStack Query:**
   ```ts
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 1000 * 60 * 5,  // 5 minutes
         retry: 2,                   // Auto-retry failed queries twice
       },
     },
   });
   ```
   Provides global query client to all child screens via `QueryClientProvider`.

3. **App Bootstrap Logic:**
   ```ts
   useEffect(() => {
     const bootstrap = () => {
       const { userId, profile } = useAppStore.getState();
       if (userId && profile) {
         setFormsCompleted(true);
       } else {
         setFormsCompleted(false);
       }
     };
     
     // Wait for AsyncStorage hydration before checking state
     if (useAppStore.persist.hasHydrated()) {
       bootstrap();
     } else {
       const unsub = useAppStore.persist.onFinishHydration(bootstrap);
       return unsub;
     }
   }, []);
   ```

   **Flow:**
   - On app start, Zustand rehydrates AsyncStorage → loads persisted store state
   - `bootstrap()` checks if `userId` and `profile` exist
   - If both exist → `formsCompleted = true` (skip forms)
   - Otherwise → `formsCompleted = false` (show forms)
   - This logic runs on app mount, then never again

4. **Stack Navigation Setup:**
   ```ts
   <Stack>
     <Stack.Screen name="index" options={{ headerShown: false }} />
     <Stack.Screen name="diet" options={{ headerShown: false }} />
     <!-- ... other screens ... -->
     <Stack.Screen name="forms/name" options={{ headerShown: false }} />
     <!-- ... form screens ... -->
   </Stack>
   ```
   Registers all navigable screens and disables default headers.

5. **Status Bar:**
   ```ts
   <StatusBar style="auto" />
   ```
   Renders iOS/Android status bar.

### Global State Providers

```
_layout.tsx
├─ QueryClientProvider (TanStack Query)
├─ Stack (expo-router)
└─ StatusBar (expo-status-bar)
```

All child screens have access to these providers.

---

## `index.tsx` — Home Screen

### Purpose

Main entry point after onboarding; displays navigation hub and diet generation status.

### Gate Logic

```ts
const formsCompleted = useAppStore((s) => s.formsCompleted);
if (!formsCompleted) return <Redirect href="/forms/name" />;
```

If `formsCompleted === false`, user is redirected to first form. This ensures no one can reach home without completing onboarding.

### Main Content

Three large navigational buttons (140px height each):

| Button | Destination | Purpose |
|---|---|---|
| Diet | `/diet` | View & refine meal plan |
| Journey | `/journey` | Progress tracking (stub) |
| Chat | `/chat` | Talk to AI nutritionist |

### Diet Generation Indicator

```ts
const dietLoading = useAppStore((s) => s.dietLoading);

// In Diet button:
{dietLoading
  ? <ActivityIndicator size="large" color="#000" />
  : <View className="w-12 h-12 border-2 border-black rounded-full" />
}
```

Shows a spinner in the Diet button while diet is being generated (fires in background from `dishes.tsx`).

### Bottom Navbar

Three circle buttons:

| Position | Icon | Action | Destination |
|---|---|---|---|
| Left | Outline circle | Settings | `/settings` |
| Center | Filled black circle | Camera | Launch camera (no-op — not integrated) |
| Right | Outline circle | Profile | `/profile` |

---

## `diet.tsx` — Meal Plan Screen

### Purpose

Displays the weekly meal plan and allows refinement via AI feedback.

### State

```ts
const dietPlan = useAppStore((s) => s.dietPlan);
const dietLoading = useAppStore((s) => s.dietLoading);
const dietError = useAppStore((s) => s.dietError);
const profile = useAppStore((s) => s.profile);

const [feedback, setFeedback] = useState('');
const [isRefining, setIsRefining] = useState(false);
```

### UI States

1. **Loading:**
   ```
   Spinner + "Generating your personalized meal plan..."
   ```
   Shown while `dietLoading === true` (background generation from onboarding).

2. **Error:**
   ```
   "Could not generate diet plan"
   + Error message detail
   ```
   Shown when `dietError !== null`.

3. **No Plan:**
   ```
   "No diet plan available"
   + "Complete your profile to generate a meal plan"
   ```
   Shown when `dietPlan === null`.

4. **Success:**
   Displays 7-day meal plan:
   - Each day is a card with black border
   - Each meal (breakfast, lunch, dinner, snack) is a sub-card
   - Meal type, name, description (with calories/macros) displayed
   - Notes section with general nutrition tips

### Refinement Section

```
[TextInput] "Tell us what you'd like to change..."
[Button] "Update Plan"
```

**`submitFeedback()` flow:**
1. Guard: Require non-empty feedback, existing plan, existing profile
2. Set `isRefining = true` (disables input/button)
3. Call `refineDietPlan(profile, dietPlan, feedback)`
4. Update plan in store: `setDietPlan(refinedPlan)`
5. Clear feedback, show success alert
6. Catch errors, show error alert
7. Finally: Set `isRefining = false`

---

## `chat.tsx` — AI Chat Screen

### Purpose

Conversational interface with Gemini AI for nutrition advice, recipe suggestions, motivation.

### State

```ts
type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const [messages, setMessages] = useState<Message[]>([
  { id: '0', role: 'assistant', text: "Hi! I'm your nutrition assistant..." }
]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

Initial message is a greeting from the assistant.

### System Prompt

```
You are a friendly and knowledgeable nutrition assistant. Help users with:
- Diet advice and healthy eating tips
- Recipe suggestions
- Nutritional information
- Healthy habits and lifestyle tips
- Motivation and support for their fitness goals

Keep responses concise and practical. Be encouraging and supportive.
```

This is prepended to each API call to set the AI's tone.

### `sendMessage()` Flow

1. Guard: Require non-empty input
2. Create user message with timestamp ID
3. Add to messages array, clear input
4. Set `isLoading = true`
5. Build conversation history (all prior messages)
6. Call Gemini API with system prompt + history
7. Parse response, create assistant message
8. Add to messages array
9. Scroll to end (auto-scroll via `useEffect`)
10. Finally: Set `isLoading = false`

### Auto-Scroll

```ts
useEffect(() => {
  scrollViewRef.current?.scrollToEnd({ animated: true });
}, [messages]);
```

On each new message, scroll to the bottom of the chat.

---

## `settings.tsx` — Settings Screen

### Purpose

User account and app settings; currently just logout.

### State

No local state — all via Zustand.

### Logout

**`logout()` function:**

1. Show confirmation alert: "Logout" + "Are you sure?"
2. On confirm, clear ALL user data:
   ```ts
   setProfile(null);
   setUserId(null);
   setToken(null);
   setFormsCompleted(false);
   setDietPlan(null);
   setTempProfile({});
   router.replace('/forms/name');
   ```
3. Redirect to first form for re-onboarding

**Effect:** Clears AsyncStorage, forces user to fill forms again from scratch.

---

## `profile.tsx` — Profile Screen (Stub)

### Current State

```tsx
<View className="flex-1 justify-center items-center">
  <Text className="text-2xl font-bold">Profil</Text>
</View>
```

**Status:** Placeholder. Will display user profile info (name, age, goals, current metrics, edit options).

---

## `journey.tsx` — Progress Tracking (Stub)

### Current State

```tsx
<View className="flex-1 justify-center items-center">
  <Text className="text-2xl font-bold">Journey</Text>
</View>
```

**Status:** Placeholder. Will show progress over time (weight, compliance with plan, meal history).

---

## Navigation Map

```
_layout.tsx (root)
├─ index.tsx (home / hub)
│  ├─ /diet → diet.tsx
│  ├─ /journey → journey.tsx
│  ├─ /chat → chat.tsx
│  ├─ /profile → profile.tsx
│  └─ /settings → settings.tsx
│
├─ /forms/name → name.tsx
├─ /forms/gender → gender.tsx
├─ /forms/age → age.tsx
├─ /forms/height → height.tsx
├─ /forms/weight → weight.tsx
├─ /forms/goal → goal.tsx
└─ /forms/dishes → dishes.tsx
```

---

## Styling

All screens use **NativeWind** (Tailwind CSS for React Native):

```tsx
<View className="flex-1 px-6 py-12">
  <Text className="text-2xl font-bold">Title</Text>
  <Pressable className="border-2 border-black rounded-xl p-4">
    <Text className="font-semibold">Button</Text>
  </Pressable>
</View>
```

**Design system:** Black borders, white backgrounds, minimal styling.

