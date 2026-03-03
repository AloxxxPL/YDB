import { Text, View } from 'react-native';
import { useAppStore } from '../store/app';

export default function Index() {
  const { isReady, setReady } = useAppStore();

  return (
    <View className="flex-1 justify-center items-center bg-white gap-4">
      <Text className="text-2xl font-bold text-blue-600">YDB</Text>
      <Text className="text-gray-600">isReady: {String(isReady)}</Text>
      <Text
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        onPress={() => setReady(!isReady)}
      >
        Toggle Ready
      </Text>
    </View>
  );
}
