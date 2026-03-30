// Globalne typy aplikacji
export type AppStore = {
  isReady: boolean;
  setReady: (ready: boolean) => void;
  // formsCompleted — czy użytkownik przeszedł przez formularze onboardingu.
  // Tymczasowo trzymane w pamięci (Zustand bez persist).
  // W przyszłości zastąpione sprawdzeniem profilu w Supabase.
  formsCompleted: boolean;
  setFormsCompleted: (completed: boolean) => void;
};
