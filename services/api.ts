// Bazowa konfiguracja API — rozszerz o właściwy base URL
export const API_BASE = 'https://jsonplaceholder.typicode.com';

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
