import { Platform } from 'react-native';

import {
  clearToken,
  getToken,
  isTokenValid,
  saveToken,
} from '../services/token-storage';
import { clearStoredToken, seedStoredToken, validToken, expiredToken } from './helpers/mock-token';

const ACCESS_KEY = 'auth_access_token';
const EXPIRES_KEY = 'auth_expires_at';

function jwtComExp(expEmSegundos: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ exp: expEmSegundos })).toString('base64url');
  return `${header}.${payload}.assinatura`;
}

function secureStoreMock() {
  return jest.requireMock('expo-secure-store') as {
    __store: Map<string, string>;
    __reset: () => void;
  };
}

beforeEach(() => {
  secureStoreMock().__reset();
});

describe('saveToken / getToken', () => {
  it('armazena e lê um token simples', async () => {
    await saveToken('token-simples', 3600);

    const token = await getToken();
    expect(token?.accessToken).toBe('token-simples');
    expect(token?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('deriva expiresAt do exp do JWT quando presente', async () => {
    const exp = 2_000_000_000;
    await saveToken(jwtComExp(exp), 60);

    const token = await getToken();
    expect(token?.expiresAt).toBe(exp * 1000);
  });

  it('ignora JWT malformado e usa expiresIn', async () => {
    await saveToken('nao.e.um.jwt', 3600);

    const token = await getToken();
    expect(token?.expiresAt).toBeGreaterThan(Date.now() + 3_500_000);
    expect(token?.expiresAt).toBeLessThan(Date.now() + 3_601_000);
  });

  it('usa 30 dias quando expiresIn é inválido', async () => {
    await saveToken('token', 0);

    const token = await getToken();
    expect(token!.expiresAt - Date.now()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  });

  it('trata expiresIn enorme como milissegundos', async () => {
    await saveToken('token', 60 * 60 * 24 * 365 * 10 + 1);

    const token = await getToken();
    const diffAnos = (token!.expiresAt - Date.now()) / (365 * 24 * 60 * 60 * 1000);
    expect(diffAnos).toBeLessThan(2);
  });

  it('particiona tokens longos em chunks', async () => {
    const tokenLongo = 'a'.repeat(4000);
    await saveToken(tokenLongo, 3600);

    const store = secureStoreMock().__store;
    expect(store.get(`${ACCESS_KEY}.chunks`)).toBe('3');
    expect(store.get(ACCESS_KEY)).toBeUndefined();

    const token = await getToken();
    expect(token?.accessToken).toBe(tokenLongo);
  });

  it('retorna null quando não há token', async () => {
    expect(await getToken()).toBeNull();
  });

  it('limpa e retorna null quando expiresAt é corrompido', async () => {
    seedStoredToken(validToken());
    secureStoreMock().__store.set(EXPIRES_KEY, 'não-é-número');

    expect(await getToken()).toBeNull();
    expect(secureStoreMock().__store.has(ACCESS_KEY)).toBe(false);
  });

  it('retorna null quando falta expiresAt', async () => {
    secureStoreMock().__store.set(ACCESS_KEY, 'token-sem-validade');

    expect(await getToken()).toBeNull();
  });
});

describe('isTokenValid', () => {
  it('true para token não expirado', async () => {
    seedStoredToken(validToken());
    expect(await isTokenValid()).toBe(true);
  });

  it('false para token expirado', async () => {
    seedStoredToken(expiredToken());
    expect(await isTokenValid()).toBe(false);
  });

  it('false sem token armazenado', async () => {
    expect(await isTokenValid()).toBe(false);
  });
});

describe('clearToken', () => {
  it('remove token e validade', async () => {
    seedStoredToken(validToken());

    await clearToken();

    expect(secureStoreMock().__store.has(ACCESS_KEY)).toBe(false);
    expect(secureStoreMock().__store.has(EXPIRES_KEY)).toBe(false);
    expect(await getToken()).toBeNull();
  });

  it('remove chunks de token longo', async () => {
    await saveToken('b'.repeat(4000), 3600);
    expect(secureStoreMock().__store.has(`${ACCESS_KEY}.chunks`)).toBe(true);

    await clearToken();

    expect([...secureStoreMock().__store.keys()]).toHaveLength(0);
  });
});

describe('caminho web (localStorage)', () => {
  const memoria = new Map<string, string>();
  let descriptorOS: PropertyDescriptor | undefined;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memoria.get(key) ?? null,
        setItem: (key: string, value: string) => memoria.set(key, value),
        removeItem: (key: string) => memoria.delete(key),
      },
    });
    descriptorOS = Object.getOwnPropertyDescriptor(Platform, 'OS');
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  afterAll(() => {
    if (descriptorOS) {
      Object.defineProperty(Platform, 'OS', descriptorOS);
    } else {
      Reflect.deleteProperty(Platform, 'OS');
    }
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('salva e lê token sem passar pelo SecureStore', async () => {
    await saveToken('token-web', 3600);

    expect(memoria.get(ACCESS_KEY)).toBe('token-web');
    const token = await getToken();
    expect(token?.accessToken).toBe('token-web');
  });

  it('remove token do localStorage', async () => {
    await saveToken('token-web', 3600);

    await clearToken();

    expect(memoria.has(ACCESS_KEY)).toBe(false);
    expect(await getToken()).toBeNull();
  });
});

beforeEach(() => {
  clearStoredToken();
});
