import { Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/app';

export default function SettingsScreen() {
  const router = useRouter();
  const setProfile = useAppStore((s) => s.setProfile);
  const setUserId = useAppStore((s) => s.setUserId);
  const setToken = useAppStore((s) => s.setToken);
  const setFormsCompleted = useAppStore((s) => s.setFormsCompleted);
  const setDietPlan = useAppStore((s) => s.setDietPlan);
  const setTempProfile = useAppStore((s) => s.setTempProfile);
  const setChatMessages = useAppStore((s) => s.setChatMessages);

  function logout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          setProfile(null);
          setUserId(null);
          setToken(null);
          setFormsCompleted(false);
          setDietPlan(null);
          setTempProfile({});
          setChatMessages([]);
          router.replace('/forms/name');
        },
      },
    ]);
  }

  return (
    <View className="flex-1 px-6 py-12">
      <Text className="text-2xl font-bold mb-8">Settings</Text>

      <Pressable
        onPress={logout}
        className="border-2 border-black rounded-xl p-4 items-center bg-red-50"
      >
        <Text className="font-semibold text-base text-red-600">Logout</Text>
      </Pressable>
    </View>
  );
}