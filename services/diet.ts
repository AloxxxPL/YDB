import { geminiModel } from './gemini';
import type { Profile } from '../types/supabase';
import type { DietPlan } from '../types';

const LANGUAGE_NAMES: Record<string, string> = {
  pl: 'Polish', en: 'English', de: 'German', fr: 'French',
  es: 'Spanish', it: 'Italian', pt: 'Portuguese', ru: 'Russian',
  uk: 'Ukrainian', cs: 'Czech', sk: 'Slovak', nl: 'Dutch',
  sv: 'Swedish', no: 'Norwegian', da: 'Danish', fi: 'Finnish',
  hu: 'Hungarian', ro: 'Romanian', tr: 'Turkish', ja: 'Japanese',
  zh: 'Chinese', ko: 'Korean', ar: 'Arabic',
};

function getDeviceLanguage(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale; // np. 'pl-PL', 'en-US'
    const code = locale.split('-')[0].toLowerCase();
    return LANGUAGE_NAMES[code] ?? 'English';
  } catch {
    return 'English';
  }
}

export async function generateDietPlan(profile: Profile): Promise<DietPlan> {
  const language = getDeviceLanguage();
  const prompt = `You are a professional nutritionist. Generate a detailed 7-day meal plan for a user with the following profile:

Name: ${profile.name}
Age: ${profile.age}
Gender: ${profile.gender}
Height: ${profile.height_cm} cm
Weight: ${profile.weight_kg} kg
Goals: ${profile.goal.join(', ')}
Favorite dishes/ingredients: ${profile.dishes.join(', ')}

Create a balanced, personalized meal plan for the entire week (Monday to Sunday). For each day, provide breakfast, lunch, dinner, and 1-2 snacks.

RULES:
1. Write all meal names, descriptions and notes in ${language}
2. Use the user's favorite dishes frequently
3. Align meals with their goals (${profile.goal.join(', ')})
4. Keep portions appropriate for their metrics
5. Include calorie/macro estimates
6. Return ONLY valid JSON, no additional text

IMPORTANT: Return the response in valid JSON format (no markdown, just raw JSON) with this exact structure:
{
  "week": 1,
  "days": [
    {
      "day": "Monday",
      "meals": [
        {"type": "breakfast", "name": "Meal Name", "description": "Brief description with calories/macros"},
        {"type": "lunch", "name": "Meal Name", "description": "Brief description"},
        {"type": "dinner", "name": "Meal Name", "description": "Brief description"},
        {"type": "snack", "name": "Snack Name", "description": "Brief description"}
      ]
    }
  ],
  "notes": "General nutrition tips for this user"
}

`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Gemini response');
    }

    const parsedPlan = JSON.parse(jsonMatch[0]) as DietPlan;

    // Validate structure
    if (!parsedPlan.days || !Array.isArray(parsedPlan.days) || parsedPlan.days.length !== 7) {
      throw new Error('Invalid diet plan structure: expected 7 days');
    }

    return parsedPlan;
  } catch (error) {
    console.error('Diet generation error:', error);
    throw new Error(`Failed to generate diet plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function refineDietPlan(
  profile: Profile,
  currentPlan: DietPlan,
  feedback: string
): Promise<DietPlan> {
  const language = getDeviceLanguage();
  const prompt = `You are a professional nutritionist. The user provided feedback on their meal plan. Update it based on their feedback.

User Profile:
- Goals: ${profile.goal.join(', ')}
- Favorite dishes: ${profile.dishes.join(', ')}

Current Plan Week ${currentPlan.week}:
${currentPlan.days.map((day) => `${day.day}: ${day.meals.map((m) => m.name).join(', ')}`).join('\n')}

User Feedback: ${feedback}

Generate an improved 7-day meal plan incorporating their feedback. Return ONLY valid JSON (no markdown) with this structure:
{
  "week": ${currentPlan.week + 1},
  "days": [
    {
      "day": "Monday",
      "meals": [
        {"type": "breakfast", "name": "Meal Name", "description": "Description with calories"},
        {"type": "lunch", "name": "Meal Name", "description": "Description"},
        {"type": "dinner", "name": "Meal Name", "description": "Description"},
        {"type": "snack", "name": "Snack Name", "description": "Description"}
      ]
    }
  ],
  "notes": "Updated nutrition tips"
}

Make sure to address all feedback points while maintaining nutritional balance.
Write all meal names, descriptions and notes in ${language}.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Gemini response');
    }

    const parsedPlan = JSON.parse(jsonMatch[0]) as DietPlan;

    if (!parsedPlan.days || !Array.isArray(parsedPlan.days) || parsedPlan.days.length !== 7) {
      throw new Error('Invalid diet plan structure');
    }

    return parsedPlan;
  } catch (error) {
    console.error('Diet refinement error:', error);
    throw new Error(`Failed to refine diet plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
