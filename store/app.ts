import { create } from 'zustand';
import type { AppStore } from '../types';

export const useAppStore = create<AppStore>((set) => ({
  isReady: false,
  setReady: (ready) => set({ isReady: ready }),
  // Tymczasowo false przy każdym starcie — użytkownik musi przejść formularze.
  // TODO: zastąpić sprawdzeniem profilu w Supabase (patrz docs/supabase-architecture.md)
  formsCompleted: false,
  setFormsCompleted: (completed) => set({ formsCompleted: completed }),
}));
