import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppStore, TempProfile } from '../types';

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isReady: false,
      setReady: (ready) => set({ isReady: ready }),

      // Autentykacja — przechowywana w AsyncStorage dzięki persist
      token: null,
      setToken: (token) => set({ token }),

      userId: null,
      setUserId: (userId) => set({ userId }),

      // Profil z Supabase
      profile: null,
      setProfile: (profile) => set({ profile }),

      // Tymczasowy profil w trakcie formularzy
      tempProfile: {},
      setTempProfile: (tempProfile) => set({ tempProfile }),
      updateTempProfile: (partial) =>
        set((state) => ({
          tempProfile: { ...state.tempProfile, ...partial },
        })),

      // Flaga czy formularze zostały wypełnione
      formsCompleted: false,
      setFormsCompleted: (completed) => set({ formsCompleted: completed }),
    }),
    {
      name: 'app-store', // key w AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // kompatybilne z Zustand
    }
  )
);
