import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppStore } from '../store/app';
import { refineDietPlan } from '../services/diet';

export default function DietScreen() {
  const dietPlan = useAppStore((s) => s.dietPlan);
  const dietLoading = useAppStore((s) => s.dietLoading);
  const dietError = useAppStore((s) => s.dietError);
  const profile = useAppStore((s) => s.profile);
  const setDietPlan = useAppStore((s) => s.setDietPlan);
  const setDietLoading = useAppStore((s) => s.setDietLoading);
  const setDietError = useAppStore((s) => s.setDietError);

  const [feedback, setFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  async function submitFeedback() {
    if (!feedback.trim() || !dietPlan || !profile) return;

    setIsRefining(true);
    try {
      const refinedPlan = await refineDietPlan(profile, dietPlan, feedback.trim());
      setDietPlan(refinedPlan);
      setFeedback('');
      Alert.alert('Success', 'Diet plan updated based on your feedback');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to refine diet plan');
    } finally {
      setIsRefining(false);
    }
  }

  // Loading state
  if (dietLoading) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-lg font-semibold text-center">Generating your personalized meal plan...</Text>
      </View>
    );
  }

  // Error state
  if (dietError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-red-600 text-center mb-4">Could not generate diet plan</Text>
        <Text className="text-base text-center text-gray-600">{dietError}</Text>
      </View>
    );
  }

  // No plan state
  if (!dietPlan) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-center">No diet plan available</Text>
        <Text className="text-sm text-gray-600 mt-2 text-center">Complete your profile to generate a meal plan</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-center mb-6">Your Weekly Meal Plan</Text>

        {/* Days */}
        {dietPlan.days.map((day, dayIndex) => (
          <View key={dayIndex} className="border-2 border-black rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold mb-3">{day.day}</Text>

            {/* Meals for this day */}
            {day.meals.map((meal, mealIndex) => (
              <View
                key={mealIndex}
                className="bg-gray-100 rounded-lg p-3 mb-2 border-l-4 border-black"
              >
                <Text className="font-semibold capitalize text-sm text-gray-700">{meal.type}</Text>
                <Text className="text-base font-semibold mt-1">{meal.name}</Text>
                <Text className="text-sm text-gray-600 mt-1">{meal.description}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Feedback Section */}
        <Text className="text-lg font-bold mt-6 mb-4">Customize Your Plan</Text>
        <View className="border-2 border-black rounded-xl p-4 mb-6">
          <Text className="text-sm text-gray-600 mb-3">
            Tell us what you'd like to change about this meal plan
          </Text>
          <TextInput
            className="border-2 border-black rounded-lg p-3 min-h-20 text-base"
            placeholder="e.g., I don't like seafood, add more vegetarian options..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            editable={!isRefining}
          />

          <Pressable
            onPress={submitFeedback}
            disabled={!feedback.trim() || isRefining}
            className={`border-2 border-black rounded-lg p-3 items-center mt-3 ${
              !feedback.trim() || isRefining ? 'opacity-30' : ''
            }`}
          >
            {isRefining ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="font-semibold text-base">Update Plan</Text>
            )}
          </Pressable>
        </View>

        <View className="h-6" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

