import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "auth_access_token";
const EXPIRES_AT_KEY = "auth_expires_at";

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

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveToken(
  accessToken: string,
  expiresIn: number
): Promise<void> {
  const jwtExpiresAt = getJwtExpiresAt(accessToken);
  const expiresInSeconds = Number(expiresIn);
  const expiresAt =
    jwtExpiresAt ??
    (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? Date.now() + expiresInSeconds * 1000
      : 0);

  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(EXPIRES_AT_KEY, String(expiresAt)),
  ]);
}

export async function getToken(): Promise<StoredToken | null> {
  const [accessToken, expiresAt] = await Promise.all([
    getItem(ACCESS_TOKEN_KEY),
    getItem(EXPIRES_AT_KEY),
  ]);

  if (!accessToken || !expiresAt) {
    return null;
  }

  const parsedExpiresAt = Number(expiresAt);

  if (!Number.isFinite(parsedExpiresAt)) {
    await clearToken();
    return null;
  }

  return {
    accessToken,
    expiresAt: parsedExpiresAt,
  };
}

export async function isTokenValid(): Promise<boolean> {
  const stored = await getToken();

  return !!stored && stored.expiresAt > Date.now();
}

export async function clearToken(): Promise<void> {
  await Promise.all([
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(EXPIRES_AT_KEY),
  ]);
}
