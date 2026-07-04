import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const EXPIRES_AT_KEY = 'auth_expires_at';

export interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

export async function saveToken(accessToken: string, expiresIn: number): Promise<void> {
  const expiresAt = Date.now() + expiresIn * 1000;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(EXPIRES_AT_KEY, String(expiresAt));
}

export async function getToken(): Promise<StoredToken | null> {
  const [accessToken, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(EXPIRES_AT_KEY),
  ]);

  if (!accessToken || !expiresAt) return null;

  return { accessToken, expiresAt: Number(expiresAt) };
}

export async function isTokenValid(): Promise<boolean> {
  const stored = await getToken();
  return !!stored && stored.expiresAt > Date.now();
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
}
