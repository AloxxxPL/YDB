import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/app';

export default function WeightPage() {
  const router = useRouter();
  const updateTempProfile = useAppStore((s) => s.updateTempProfile);
  const savedWeight = useAppStore((s) => s.tempProfile.weight_kg?.toString() || '');
  const [weight, setWeight] = useState(savedWeight);
  const canContinue = weight.trim().length > 0;

  return (
    <View className="flex-1 justify-center px-6 gap-6">
      <Text className="text-2xl text-center font-bold">What's your weight?</Text>
      <TextInput
        className="border-2 border-black rounded-xl p-4 text-base"
        placeholder="kg"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        autoFocus
      />
      <Pressable
        onPress={() => {
          updateTempProfile({ weight_kg: parseFloat(weight) });
          router.push('/forms/goal');
        }}
        disabled={!canContinue}
        className={`border-2 border-black rounded-xl p-4 items-center ${!canContinue ? 'opacity-30' : ''}`}
      >
        <Text className="font-semibold text-base">Continue</Text>
      </Pressable>
    </View>
  );
}
