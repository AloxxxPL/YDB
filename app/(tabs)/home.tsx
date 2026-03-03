import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { usePosts } from '../../hooks/useExample';

export default function HomeScreen() {
  const { data, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Błąd: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 px-4 pb-4">
        <Text className="text-3xl font-bold text-gray-900">YDB</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="px-4 pb-8"
        renderItem={({ item }) => (
          <View className="mb-3 p-4 bg-gray-50 rounded-xl">
            <Text className="font-semibold text-gray-800">{item.title}</Text>
            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}
