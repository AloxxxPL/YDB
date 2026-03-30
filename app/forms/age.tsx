import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function AgePage() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const canContinue = age.trim().length > 0;

  return (
    <View className="flex-1 justify-center px-6 gap-6">
      <Text className="text-2xl text-center font-bold">How old are you?</Text>
      <TextInput
        className="border-2 border-black rounded-xl p-4 text-base"
        placeholder="Your age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        autoFocus
      />
      <Pressable
        onPress={() => router.push('/forms/height')}
        disabled={!canContinue}
        className={`border-2 border-black rounded-xl p-4 items-center ${!canContinue ? 'opacity-30' : ''}`}
      >
        <Text className="font-semibold text-base">Continue</Text>
      </Pressable>
    </View>
  );
}
