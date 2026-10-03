import { getToken } from '../services/token-storage';
import { installFetchMock } from './helpers/mock-fetch';
import { clearStoredToken, seedStoredToken, validToken } from './helpers/mock-token';

describe('helpers/mock-fetch', () => {
  it('roteia por URL e registra chamadas', async () => {
    const fetchMock = installFetchMock([
      { match: '/ping', body: { ok: true } },
      { match: '/pong', status: 500, body: { message: 'erro' } },
    ]);

    const ok = await fetch('https://api.test/ping');
    expect(await ok.json()).toEqual({ ok: true });

    const erro = await fetch('https://api.test/pong');
    expect(erro.ok).toBe(false);
    expect(erro.status).toBe(500);

    expect(fetchMock.calls.map((call) => call.url)).toEqual([
      'https://api.test/ping',
      'https://api.test/pong',
    ]);

    fetchMock.restore();
  });

  it('falha quando a URL não tem rota', async () => {
    const fetchMock = installFetchMock([{ match: '/existe', body: {} }]);

    await expect(fetch('https://api.test/outra')).rejects.toThrow('fetch não roteado');
    expect(fetchMock.calls).toHaveLength(1);

    fetchMock.restore();
  });

  it('rotas sem match atendem em ordem e suportam JSON inválido', async () => {
    installFetchMock([{ status: 200, body: { seq: 1 } }, { invalidJson: true }]);

    const primeira = await fetch('https://api.test/a');
    expect(await primeira.json()).toEqual({ seq: 1 });

    const segunda = await fetch('https://api.test/b');
    await expect(segunda.json()).rejects.toThrow();
  });
});

describe('helpers/mock-token', () => {
  it('semeia token válido lido pelo getToken real', async () => {
    seedStoredToken(validToken({ accessToken: 'seed-token' }));

    const token = await getToken();
    expect(token?.accessToken).toBe('seed-token');
    expect(token?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('limpa o token armazenado', async () => {
    seedStoredToken(validToken());
    clearStoredToken();

    expect(await getToken()).toBeNull();
  });
});
