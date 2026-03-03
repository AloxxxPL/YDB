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
