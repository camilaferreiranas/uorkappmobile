import type { StoredToken } from '../../services/token-storage';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const EXPIRES_AT_KEY = 'auth_expires_at';

const ONE_HOUR_MS = 60 * 60 * 1000;

/** Chaves usadas internamente por `services/token-storage`. */
export const TOKEN_STORAGE_KEYS = { ACCESS_TOKEN_KEY, EXPIRES_AT_KEY };

export function validToken(overrides: Partial<StoredToken> = {}): StoredToken {
  return {
    accessToken: 'token-valido',
    expiresAt: Date.now() + ONE_HOUR_MS,
    ...overrides,
  };
}

export function expiredToken(overrides: Partial<StoredToken> = {}): StoredToken {
  return {
    accessToken: 'token-expirado',
    expiresAt: Date.now() - ONE_HOUR_MS,
    ...overrides,
  };
}

type SecureStoreMock = {
  __store: Map<string, string>;
  __reset: () => void;
};

function secureStoreMock(): SecureStoreMock {
  return jest.requireMock('expo-secure-store') as SecureStoreMock;
}

/** Semeia o SecureStore (mock global) para que `getToken()` real retorne o token. */
export function seedStoredToken(token: StoredToken): void {
  const store = secureStoreMock().__store;
  store.set(ACCESS_TOKEN_KEY, token.accessToken);
  store.set(EXPIRES_AT_KEY, String(token.expiresAt));
}

/** Garante que `getToken()` real retorne `null` (sessão ausente). */
export function clearStoredToken(): void {
  secureStoreMock().__reset();
}
