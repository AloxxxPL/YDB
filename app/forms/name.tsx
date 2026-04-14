import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/app';

export default function NamePage() {
  const router = useRouter();
  const updateTempProfile = useAppStore((s) => s.updateTempProfile);
  const savedName = useAppStore((s) => s.tempProfile.name || '');
  const [name, setName] = useState(savedName);
  const canContinue = name.trim().length > 0;

  return (
    <View className="flex-1 justify-center px-6 gap-6">
      <Text className="text-2xl text-center font-bold">What's your name?</Text>
      <TextInput
        className="border-2 border-black rounded-xl p-4 text-base"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <Pressable
        onPress={() => {
          updateTempProfile({ name });
          router.push('/forms/gender');
        }}
        disabled={!canContinue}
        className={`border-2 border-black rounded-xl p-4 items-center ${!canContinue ? 'opacity-30' : ''}`}
      >
        <Text className="font-semibold text-base">Continue</Text>
      </Pressable>
    </View>
  );
}
