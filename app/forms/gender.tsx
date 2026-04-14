import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/app';

export default function GenderPage() {
  const router = useRouter();
  const updateTempProfile = useAppStore((s) => s.updateTempProfile);

  function selectGender(gender: 'male' | 'female') {
    updateTempProfile({ gender });
    router.push('/forms/age');
  }

  return (
    <View className="flex-1 justify-center px-6 gap-6">
      <Text className="text-2xl text-center font-bold">What's your gender?</Text>
      <View className="flex-row gap-4">
        <Pressable
          onPress={() => selectGender('male')}
          className="flex-1 border-2 border-black rounded-xl p-10 items-center"
        >
          <Text className="font-semibold text-base">Male</Text>
        </Pressable>
        <Pressable
          onPress={() => selectGender('female')}
          className="flex-1 border-2 border-black rounded-xl p-10 items-center"
        >
          <Text className="font-semibold text-base">Female</Text>
        </Pressable>
      </View>
    </View>
  );
}
