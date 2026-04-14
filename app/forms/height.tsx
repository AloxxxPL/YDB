import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/app';

export default function HeightPage() {
  const router = useRouter();
  const updateTempProfile = useAppStore((s) => s.updateTempProfile);
  const savedHeight = useAppStore((s) => s.tempProfile.height_cm?.toString() || '');
  const [height, setHeight] = useState(savedHeight);
  const canContinue = height.trim().length > 0;

  return (
    <View className="flex-1 justify-center px-6 gap-6">
      <Text className="text-2xl text-center font-bold">What's your height?</Text>
      <TextInput
        className="border-2 border-black rounded-xl p-4 text-base"
        placeholder="cm"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        autoFocus
      />
      <Pressable
        onPress={() => {
          updateTempProfile({ height_cm: parseInt(height, 10) });
          router.push('/forms/weight');
        }}
        disabled={!canContinue}
        className={`border-2 border-black rounded-xl p-4 items-center ${!canContinue ? 'opacity-30' : ''}`}
      >
        <Text className="font-semibold text-base">Continue</Text>
      </Pressable>
    </View>
  );
}
