<<<<<<< HEAD
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
=======
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

const ACCESS_TOKEN_KEY = "auth_access_token";
const EXPIRES_AT_KEY = "auth_expires_at";
const CHUNK_SIZE = 1800;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TEN_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 10;
const SECURE_STORE_OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

function getJwtExpiresAt(accessToken: string): number | null {
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const payload = JSON.parse(atob(normalized));

    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
    await SecureStore.deleteItemAsync(`${key}.chunks`).catch(() => undefined);
    return;
  }

  const count = Math.ceil(value.length / CHUNK_SIZE);
  await SecureStore.setItemAsync(`${key}.chunks`, String(count), SECURE_STORE_OPTIONS);
  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.setItemAsync(
        `${key}.${index}`,
        value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
        SECURE_STORE_OPTIONS
      )
    )
  );
  await SecureStore.deleteItemAsync(key).catch(() => undefined);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  const chunks = await SecureStore.getItemAsync(`${key}.chunks`);
  const count = Number(chunks);
  if (chunks && Number.isInteger(count) && count > 0) {
    const parts = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(`${key}.${index}`)
      )
    );
    if (parts.some((part) => part == null)) return null;
    return parts.join("");
  }

  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  const chunks = await SecureStore.getItemAsync(`${key}.chunks`).catch(() => null);
  const count = Number(chunks);
  const deletions = [
    SecureStore.deleteItemAsync(key).catch(() => undefined),
    SecureStore.deleteItemAsync(`${key}.chunks`).catch(() => undefined),
  ];

  if (Number.isInteger(count) && count > 0) {
    for (let index = 0; index < count; index += 1) {
      deletions.push(SecureStore.deleteItemAsync(`${key}.${index}`).catch(() => undefined));
    }
  }

  await Promise.all(deletions);
}

function expiresAtFromExpiresIn(expiresIn: number): number | null {
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) return null;

  const durationMs =
    expiresIn > TEN_YEARS_IN_SECONDS ? expiresIn : expiresIn * 1000;

  return Date.now() + durationMs;
}

export async function saveToken(
  accessToken: string,
  expiresIn: number
): Promise<void> {
  const expiresAt =
    getJwtExpiresAt(accessToken) ??
    expiresAtFromExpiresIn(Number(expiresIn)) ??
    Date.now() + THIRTY_DAYS_MS;

  await Promise.all([
<<<<<<< HEAD
    storage.setItem(ACCESS_TOKEN_KEY, accessToken),
    storage.setItem(EXPIRES_AT_KEY, String(expiresAt)),
    storage.setItem(EMAIL_KEY, email),
=======
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(EXPIRES_AT_KEY, String(expiresAt)),
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  ]);
}

export async function getToken(): Promise<StoredToken | null> {
<<<<<<< HEAD
  const [accessToken, expiresAt, email] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(EXPIRES_AT_KEY),
    storage.getItem(EMAIL_KEY),
=======
  const [accessToken, expiresAt] = await Promise.all([
    getItem(ACCESS_TOKEN_KEY),
    getItem(EXPIRES_AT_KEY),
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  ]);

  if (!accessToken || !expiresAt) {
    return null;
  }

  const parsedExpiresAt = Number(expiresAt);

<<<<<<< HEAD
export async function saveEmail(email: string): Promise<void> {
  await storage.setItem(EMAIL_KEY, email);
=======
  if (!Number.isFinite(parsedExpiresAt)) {
    await clearToken();
    return null;
  }

  return {
    accessToken,
    expiresAt: parsedExpiresAt,
  };
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
}

export async function isTokenValid(): Promise<boolean> {
  const stored = await getToken();

  return !!stored && stored.expiresAt > Date.now();
}

export async function clearToken(): Promise<void> {
  await Promise.all([
<<<<<<< HEAD
    storage.removeItem(ACCESS_TOKEN_KEY),
    storage.removeItem(EXPIRES_AT_KEY),
    storage.removeItem(EMAIL_KEY),
=======
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(EXPIRES_AT_KEY),
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  ]);
}
