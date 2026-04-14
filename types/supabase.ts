export type Profile = {
  id: string; // = auth.users.id
  name: string;
  gender: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_kg: number;
  goal: ('lose' | 'muscle' | 'healthy')[]; // tablica wybranych celów
  dishes: string[]; // ulubione dania (JSON array)
  created_at: string;
};

export type DietPlan = {
  id: string;
  user_id: string; // = profiles.id
  plan_json: Record<string, any>;
  generated_at: string;
  is_active: boolean;
};
