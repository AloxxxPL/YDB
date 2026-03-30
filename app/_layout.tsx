import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minut
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="diet" options={{ headerShown: false }} />
        <Stack.Screen name="journey" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        {/* Formularze onboardingu — zbierają dane użytkownika przed pierwszym wejściem do aplikacji */}
        <Stack.Screen name="forms/name" options={{ headerShown: false }} />
        <Stack.Screen name="forms/gender" options={{ headerShown: false }} />
        <Stack.Screen name="forms/age" options={{ headerShown: false }} />
        <Stack.Screen name="forms/height" options={{ headerShown: false }} />
        <Stack.Screen name="forms/weight" options={{ headerShown: false }} />
        <Stack.Screen name="forms/goal" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
