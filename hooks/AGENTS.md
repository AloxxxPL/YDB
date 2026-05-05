# Hooks — Custom React Hooks

## Overview

The `hooks/` directory exports custom React hooks that encapsulate stateful or side-effect logic used across multiple components.

Currently, the project has one example hook: `useExample.ts` (for demonstration). Additional hooks can be added here as the app grows.

---

## `useExample.ts` — Template Hook

### Signature

```ts
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiFetch<Post[]>('/posts?_limit=5'),
  });
}
```

### Purpose

Example of integrating **TanStack Query** with the custom `apiFetch` utility for data fetching.

### Used By

- (Currently unused in the app — template for future data-fetching hooks)

### Pattern

This hook demonstrates best practices for building custom data-fetching hooks:

1. **Query Key:** `['posts']` — unique identifier for caching and invalidation
2. **Query Function:** Calls `apiFetch<Post[]>()` — generic, type-safe
3. **Auto Caching:** TanStack Query handles request deduplication, background refetch, stale-while-revalidate

### When to Use

**Use TanStack Query + this pattern for:**
- Fetching from custom REST API endpoints
- Need for auto-caching, background refetch, error states
- Multi-component data sharing

**Use plain `useState` + `useEffect` for:**
- Zustand store data (already persisted + globally accessible)
- One-off async operations (e.g., form submission)

---

## Future Hook Ideas

### `useDeviceDimensions()`

Wrapper around React Native's `useWindowDimensions()` — could add responsive breakpoint logic.

```ts
export function useDeviceDimensions() {
  const dims = useWindowDimensions();
  return {
    ...dims,
    isTablet: dims.width > 768,
    isLandscape: dims.width > dims.height,
  };
}
```

---

### `useFormState()`

Generic form state manager for validating and persisting form input.

```ts
export function useFormState<T>(initial: T, validate?: (v: T) => Record<string, string>) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return {
    values,
    errors,
    setFieldValue: (key: keyof T, value: any) => { /* ... */ },
    validate: () => { /* run validator, set errors */ },
  };
}
```

**Use case:** Form pages (`age.tsx`, `height.tsx`) could use this to reduce boilerplate.

---

### `useDietPlan()`

Zustand-based hook for managing diet plan state and operations.

```ts
export function useDietPlan() {
  const dietPlan = useAppStore((s) => s.dietPlan);
  const setDietPlan = useAppStore((s) => s.setDietPlan);
  const setDietLoading = useAppStore((s) => s.setDietLoading);
  const setDietError = useAppStore((s) => s.setDietError);
  
  return {
    plan: dietPlan,
    refine: async (feedback: string) => { /* ... */ },
    loading: /* ... */,
    error: /* ... */,
  };
}
```

**Use case:** Reduce boilerplate in `diet.tsx` by centralizing all diet-related state access.

---

## Naming Convention

- Use `use*` prefix (React convention)
- Descriptive: `usePosts`, `useFormState`, `useDietPlan`
- Avoid generic names: don't use `useData` or `useFetch`

---

## Best Practices

1. **Separate concerns:** Hooks should do one thing well (fetch data, manage form state, etc.)
2. **Type-safe:** Always export types/interfaces alongside hooks
3. **Composed hooks:** Hooks can call other hooks (e.g., `useDietPlan()` can use Zustand + TanStack Query together)
4. **No direct exports of singletons:** Avoid exporting bare store instances; wrap in hooks for consistency

---

