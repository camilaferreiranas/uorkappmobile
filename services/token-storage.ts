import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const EXPIRES_AT_KEY = 'auth_expires_at';
const EMAIL_KEY = 'auth_user_email';

export interface StoredToken {
  accessToken: string;
  expiresAt: number;
  email: string;
}

export async function saveToken(accessToken: string, expiresIn: number, email: string): Promise<void> {
  const expiresAt = Date.now() + expiresIn * 1000;
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(EXPIRES_AT_KEY, String(expiresAt)),
    SecureStore.setItemAsync(EMAIL_KEY, email),
  ]);
}

export async function getToken(): Promise<StoredToken | null> {
  const [accessToken, expiresAt, email] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(EXPIRES_AT_KEY),
    SecureStore.getItemAsync(EMAIL_KEY),
  ]);

  if (!accessToken || !expiresAt || !email) return null;

  return { accessToken, expiresAt: Number(expiresAt), email };
}

export async function saveEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(EMAIL_KEY, email);
}

export async function isTokenValid(): Promise<boolean> {
  const stored = await getToken();
  return !!stored && stored.expiresAt > Date.now();
}

export async function clearToken(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY),
    SecureStore.deleteItemAsync(EMAIL_KEY),
  ]);
}
