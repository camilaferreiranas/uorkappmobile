import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore has no web implementation; AsyncStorage uses browser localStorage.
const storage = Platform.OS === 'web'
  ? AsyncStorage
  : {
      getItem: SecureStore.getItemAsync,
      setItem: SecureStore.setItemAsync,
      removeItem: SecureStore.deleteItemAsync,
    };

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
    storage.setItem(ACCESS_TOKEN_KEY, accessToken),
    storage.setItem(EXPIRES_AT_KEY, String(expiresAt)),
    storage.setItem(EMAIL_KEY, email),
  ]);
}

export async function getToken(): Promise<StoredToken | null> {
  const [accessToken, expiresAt, email] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(EXPIRES_AT_KEY),
    storage.getItem(EMAIL_KEY),
  ]);

  if (!accessToken || !expiresAt || !email) return null;

  return { accessToken, expiresAt: Number(expiresAt), email };
}

export async function saveEmail(email: string): Promise<void> {
  await storage.setItem(EMAIL_KEY, email);
}

export async function isTokenValid(): Promise<boolean> {
  const stored = await getToken();
  return !!stored && stored.expiresAt > Date.now();
}

export async function clearToken(): Promise<void> {
  await Promise.all([
    storage.removeItem(ACCESS_TOKEN_KEY),
    storage.removeItem(EXPIRES_AT_KEY),
    storage.removeItem(EMAIL_KEY),
  ]);
}
