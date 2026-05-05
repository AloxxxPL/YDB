# Constants — Design Tokens & Config

## Overview

The `constants/` directory exports shared, immutable values used across the app: design tokens (colors, spacing), feature flags, and configuration constants.

Currently contains only `theme.ts`. Extend this directory as the app grows.

---

## `theme.ts` — Design System

### Colors

```ts
export const colors = {
  primary: '#3B82F6',    // Tailwind blue-500
  secondary: '#6B7280',  // Tailwind gray-500
  background: '#FFFFFF',
  surface: '#F9FAFB',    // Tailwind gray-50
  error: '#EF4444',      // Tailwind red-500
  text: {
    primary: '#111827',   // Tailwind gray-900
    secondary: '#6B7280', // Tailwind gray-500
    inverse: '#FFFFFF',
  },
} as const;
```

**Design Philosophy:** Minimalist black & white with constrained color palette (blue for primary, red for errors).

**Alignment:** Colors match Tailwind CSS scale for consistency with NativeWind styling.

### Spacing

```ts
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
} as const;
```

**Scale:** 8px base unit (standard in mobile design).

**Usage:** Reference in component styles for consistent padding/margins.

### Usage Examples

**In components:**

```tsx
import { colors, spacing } from '../../constants/theme';

export default function MyComponent() {
  return (
    <View style={{ padding: spacing.md, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
}
```

**With NativeWind (Tailwind classes):**

```tsx
<View className="p-4 bg-white">
  <Text className="text-gray-900">Styled with Tailwind</Text>
</View>
```

---

## Future Constants

### `strings.ts` — i18n / Localization

As the app expands to support multiple languages, centralize all user-facing strings:

```ts
export const strings = {
  en: {
    onboarding: {
      name: 'What\'s your name?',
      gender: 'What\'s your gender?',
      // ...
    },
    diet: {
      title: 'Your Weekly Meal Plan',
      // ...
    },
  },
  pl: {
    onboarding: {
      name: 'Jak się masz?',
      // ...
    },
  },
};
```

---

### `config.ts` — Feature Flags & Config

```ts
export const config = {
  features: {
    chatEnabled: __DEV__,        // Chat not yet ready
    groceryListEnabled: false,   // Coming soon
    multiUserEnabled: false,     // Auth not yet implemented
  },
  api: {
    timeout: 10000,              // ms
    retryCount: 3,
    retryDelay: 1000,            // ms
  },
  diet: {
    defaultWeeks: 4,             // Number of weeks to generate
    maxDishesPerDay: 4,          // breakfast + lunch + dinner + snack
  },
};
```

---

### `sizes.ts` — Reusable Dimensions

```ts
export const sizes = {
  button: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  input: {
    height: 48,
  },
  card: {
    borderRadius: 12,
    borderWidth: 2,
  },
};
```

---

## Naming Convention

- `colors` — color tokens (no value prefix)
- `spacing` — spacing scale (absolute pixel values)
- `sizes` — reusable dimensions (component-scoped)
- `strings` — user-facing text
- `config` — toggleable features and thresholds

---

## Best Practices

1. **`as const`:** Use TypeScript `as const` assertion for type-safe constant inference
   ```ts
   export const spacing = { xs: 4, sm: 8 } as const;
   // Infers: typeof spacing.xs === 4 (literal, not number)
   ```

2. **Namespacing:** Group related constants to avoid flat namespace
   ```ts
   colors.text.primary  // better than textPrimary
   ```

3. **Documentation:** Comment non-obvious choices
   ```ts
   // Tailwind gray-900 (darkest gray) for legibility on white backgrounds
   primary: '#111827'
   ```

4. **Avoid:** Don't hardcode values in components — always reference constants

