import { Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/home';

function Navbar() {
  const router = useRouter();

  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    await ImagePicker.launchCameraAsync({ allowsEditing: false });
  }

  return (
    <View style={styles.navbar}>
      <Pressable onPress={() => router.push('/journey')} style={styles.navBtn}>
        <View style={styles.navDot} />
      </Pressable>
      <Pressable onPress={openCamera} style={styles.navBtn}>
        <View style={styles.cameraDot} />
      </Pressable>
      <Pressable onPress={() => router.push('/profile')} style={styles.navBtn}>
        <View style={styles.navDot} />
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <View className="flex-1 justify-between">
      <View style={styles.topPadding}>
        <Pressable
          onPress={() => router.push('/diet')}
          style={[styles.dietButton, { width: width - 48 }]}
        />
      </View>
      <Navbar />
    </View>
  );
}
