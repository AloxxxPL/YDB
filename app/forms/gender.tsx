import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function GenderPage() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center px-6 gap-6">
      <Text className="text-2xl text-center font-bold">What's your gender?</Text>
      <View className="flex-row gap-4">
        <Pressable
          onPress={() => router.push('/forms/age')}
          className="flex-1 border-2 border-black rounded-xl p-10 items-center"
        >
          <Text className="font-semibold text-base">Male</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/forms/age')}
          className="flex-1 border-2 border-black rounded-xl p-10 items-center"
        >
          <Text className="font-semibold text-base">Female</Text>
        </Pressable>
      </View>
    </View>
  );
}
