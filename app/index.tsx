import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { usePosts } from '../hooks/useExample';

export default function Index() {
  const { data, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Błąd: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      <Text className="text-2xl font-bold text-center mb-4">YDB</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 p-4 bg-gray-50 rounded-xl">
            <Text className="font-semibold text-gray-800">{item.title}</Text>
            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}
