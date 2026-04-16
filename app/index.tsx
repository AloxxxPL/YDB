import { Pressable, View, useWindowDimensions, ScrollView, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/app';

function Navbar() {
  const router = useRouter();

  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    await ImagePicker.launchCameraAsync({ allowsEditing: false });
  }

  return (
    <View className="flex-row justify-between items-center mx-6 mb-6 py-3 px-8 border-2 border-black rounded-full">
      <Pressable onPress={() => router.push('/settings')} className="p-2">
        <View className="w-4.5 h-4.5 border-2 border-black rounded-full" style={{ width: 18, height: 18 }} />
      </Pressable>
      <Pressable onPress={openCamera} className="p-2">
        <View className="w-7 h-7 bg-black rounded-full" />
      </Pressable>
      <Pressable onPress={() => router.push('/profile')} className="p-2">
        <View className="w-4.5 h-4.5 border-2 border-black rounded-full" style={{ width: 18, height: 18 }} />
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const formsCompleted = useAppStore((s) => s.formsCompleted);
  const dietLoading = useAppStore((s) => s.dietLoading);

  if (!formsCompleted) return <Redirect href="/forms/name" />;

  const buttonWidth = width - 48;
  const buttonHeight = 140;

  return (
    <View className="flex-1 justify-between">
      <ScrollView className="flex-1 pt-6 px-6" showsVerticalScrollIndicator={false}>
        {/* Diet Button */}
        <Pressable
          onPress={() => router.push('/diet')}
          className="border-2 border-black rounded-2xl mb-4 items-center justify-center"
          style={{ width: buttonWidth, height: buttonHeight }}
        >
          <View className="w-full h-full items-center justify-center">
            {dietLoading
              ? <ActivityIndicator size="large" color="#000" />
              : <View className="w-12 h-12 border-2 border-black rounded-full" />
            }
          </View>
        </Pressable>

        {/* Journey Button */}
        <Pressable
          onPress={() => router.push('/journey')}
          className="border-2 border-black rounded-2xl mb-4 items-center justify-center"
          style={{ width: buttonWidth, height: buttonHeight }}
        >
          <View className="w-full h-full items-center justify-center">
            <View className="w-12 h-12 border-2 border-black rounded-full" />
          </View>
        </Pressable>

        {/* Chat Button */}
        <Pressable
          onPress={() => router.push('/chat')}
          className="border-2 border-black rounded-2xl mb-4 items-center justify-center"
          style={{ width: buttonWidth, height: buttonHeight }}
        >
          <View className="w-full h-full items-center justify-center">
            <View className="w-12 h-12 border-2 border-black rounded-full" />
          </View>
        </Pressable>
      </ScrollView>

      {/* Navbar */}
      <Navbar />
    </View>
  );
}
