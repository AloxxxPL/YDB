import type { Profile, DietPlan as DietPlanDB } from './supabase';

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

// Plan diety - struktura dla wyświetlania
export type DietPlan = {
  week: number;
  days: Array<{
    day: string; // Monday, Tuesday, etc
    meals: Array<{
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      name: string;
      description: string;
    }>;
  }>;
  notes: string;
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

  // Plan diety - wygenerowany przez Gemini
  dietPlan: DietPlan | null;
  setDietPlan: (plan: DietPlan | null) => void;

  // Stan generowania diety
  dietLoading: boolean;
  setDietLoading: (loading: boolean) => void;

  // Błędy diety
  dietError: string | null;
  setDietError: (error: string | null) => void;
};
