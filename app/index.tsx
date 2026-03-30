import { Pressable, View, useWindowDimensions } from 'react-native';
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
      <Pressable onPress={() => router.push('/journey')} className="p-2">
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

  if (!formsCompleted) return <Redirect href="/forms/name" />;

  return (
    <View className="flex-1 justify-between">
      <View className="pt-14 px-6">
        <Pressable
          onPress={() => router.push('/diet')}
          className="border-2 border-black rounded-2xl"
          style={{ width: width - 48, height: 180 }}
        />
      </View>
      <Navbar />
    </View>
  );
}
