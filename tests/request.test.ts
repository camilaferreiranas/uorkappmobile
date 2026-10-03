import { request } from '../services/request';
import { jsonResponse } from './helpers/mock-fetch';

function instalarFetch(fn: () => Promise<unknown>) {
  Object.assign(globalThis, { fetch: jest.fn(fn) });
}

describe('request', () => {
  it('retorna a resposta quando a chamada succeeds', async () => {
    instalarFetch(async () => jsonResponse({ ok: true }) as never);

    const response = await request('https://api.test/x');
    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('traduz falha de conexão em mensagem amigável', async () => {
    instalarFetch(async () => {
      throw new TypeError('Network request failed');
    });

    await expect(request('https://api.test/x')).rejects.toThrow(
      'Houve um erro ao realizar essa operação. Tente novamente.'
    );
  });

  it('preserva AbortError', async () => {
    instalarFetch(async () => {
      const erro = new Error('aborted');
      erro.name = 'AbortError';
      throw erro;
    });

    await expect(request('https://api.test/x')).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
