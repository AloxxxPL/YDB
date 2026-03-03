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
