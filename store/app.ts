import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppStore, ChatMessage } from '../types';

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

      // Plan diety — wygenerowany przez Gemini
      dietPlan: null,
      setDietPlan: (plan) => set({ dietPlan: plan }),

      // Stan generowania diety
      dietLoading: false,
      setDietLoading: (loading) => set({ dietLoading: loading }),

      // Błędy diety
      dietError: null,
      setDietError: (error) => set({ dietError: error }),

      // Historia chatów
      chatMessages: [],
      setChatMessages: (chatMessages) => set({ chatMessages }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
    }),
    {
      name: 'app-store', // key w AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // kompatybilne z Zustand
    }
  )
);
