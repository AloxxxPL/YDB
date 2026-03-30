import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/app';

const GOALS = [
  'Drop few pounds',
  'Gain muscle tissue',
  'Create healthier habits',
];

export default function GoalPage() {
  const router = useRouter();
  const setFormsCompleted = useAppStore((s) => s.setFormsCompleted);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(goal: string) {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function confirm() {
    setFormsCompleted(true);
    router.replace('/');
  }

  return (
    <View className="flex-1 justify-center px-6 gap-4">
      <Text className="text-2xl text-center font-bold">What's your goal?</Text>
      {GOALS.map((goal) => {
        const isSelected = selected.includes(goal);
        return (
          <Pressable
            key={goal}
            onPress={() => toggle(goal)}
            className={`border-2 border-black rounded-xl p-6 ${isSelected ? 'bg-black' : ''}`}
          >
            <Text className={`text-base ${isSelected ? 'text-white' : ''}`}>
              {goal}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={confirm}
        disabled={selected.length === 0}
        className={`border-2 border-black rounded-xl p-4 items-center ${selected.length === 0 ? 'opacity-30' : ''}`}
      >
        <Text className="font-semibold text-base">Continue</Text>
      </Pressable>
    </View>
  );
}
