import { API_URL } from '../services/api_url';
import { buscarCategorias } from '../services/categoriaService';
import { installFetchMock } from './helpers/mock-fetch';
import { clearStoredToken, expiredToken, seedStoredToken, validToken } from './helpers/mock-token';

const categorias = [
  { id: 1, nome: 'Elétrica' },
  { id: 2, nome: 'Hidráulica' },
];

beforeEach(() => {
  seedStoredToken(validToken({ accessToken: 'token-de-teste' }));
});

afterEach(() => {
  clearStoredToken();
});

describe('buscarCategorias', () => {
  it('retorna a lista de categorias com Authorization JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/categorias', body: categorias },
    ]);

    await expect(buscarCategorias()).resolves.toEqual(categorias);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/categorias`);
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    fetchMock.restore();
  });

  it('retorna lista vazia quando o corpo não é uma lista', async () => {
    installFetchMock([{ match: '/categorias', body: { success: true, data: categorias } }]);

    await expect(buscarCategorias()).resolves.toEqual([]);
  });

  it('bloqueia sessão ausente ou expirada antes da requisição', async () => {
    for (const token of [null, expiredToken()] as const) {
      if (token === null) clearStoredToken();
      else seedStoredToken(token);
      const fetchMock = installFetchMock([]);

      await expect(buscarCategorias()).rejects.toThrow('Sessão expirada. Entre novamente.');
      expect(fetchMock.calls).toHaveLength(0);
      fetchMock.restore();
    }
  });

  it('usa erros de validação da API', async () => {
    installFetchMock([
      { match: '/categorias', status: 403, body: { erros: ['Cadastro inativo'] } },
    ]);

    await expect(buscarCategorias()).rejects.toThrow('Cadastro inativo');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([
      { match: '/categorias', status: 500, body: { message: 'Indisponível no momento' } },
    ]);

    await expect(buscarCategorias()).rejects.toThrow('Indisponível no momento');
  });

  it('resposta de erro não JSON usa mensagem padrão', async () => {
    installFetchMock([{ match: '/categorias', status: 500, invalidJson: true }]);

    await expect(buscarCategorias()).rejects.toThrow(
      'Não foi possível carregar as categorias.'
    );
  });

  it('resposta de sucesso não JSON vira lista vazia', async () => {
    installFetchMock([{ match: '/categorias', status: 200, invalidJson: true }]);

    await expect(buscarCategorias()).resolves.toEqual([]);
  });

  it('propaga erro de rede', async () => {
    Object.assign(globalThis, {
      fetch: jest.fn(async () => {
        throw new TypeError('Network request failed');
      }),
    });

    await expect(buscarCategorias()).rejects.toThrow('Network request failed');
  });
});
