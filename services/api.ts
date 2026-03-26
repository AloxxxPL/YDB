import Constants from 'expo-constants';

// Na fizycznym telefonie localhost = telefon, nie maszyna dev.
// Expo dostarcza LAN IP maszyny dev przez Constants.expoConfig.hostUri.
function getApiBase(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:${process.env.EXPO_PUBLIC_PORT ?? '3000'}`;
    }
  }
  return process.env.EXPO_PUBLIC_API_URL ?? 'https://jsonplaceholder.typicode.com';
}

export const API_BASE = getApiBase();

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
