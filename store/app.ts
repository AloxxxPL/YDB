import { create } from 'zustand';
import type { AppStore } from '../types';

export const useAppStore = create<AppStore>((set) => ({
  isReady: false,
  setReady: (ready) => set({ isReady: ready }),
}));
