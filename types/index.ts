import type { Profile } from './supabase';

// Tymczasowy profil w trakcie formularzy onboardingu
export type TempProfile = {
  name?: string;
  gender?: 'male' | 'female';
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goal?: ('lose' | 'muscle' | 'healthy')[]; // tablica wybranych celów
  dishes?: string[]; // ulubione dania
};

// Globalne typy aplikacji
export type AppStore = {
  isReady: boolean;
  setReady: (ready: boolean) => void;

  // Autentykacja
  token: string | null;
  setToken: (token: string | null) => void;

  userId: string | null;
  setUserId: (userId: string | null) => void;

  // Profil użytkownika z Supabase
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;

  // Tymczasowy profil w trakcie formularzy (persisted w AsyncStorage)
  tempProfile: TempProfile;
  setTempProfile: (tempProfile: TempProfile) => void;
  updateTempProfile: (partial: Partial<TempProfile>) => void;

  // Flaga czy formularze zostały uzupełnione
  formsCompleted: boolean;
  setFormsCompleted: (completed: boolean) => void;
};
