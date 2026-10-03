import { API_URL } from '../services/api_url';
import { type CreateUserPayload, createUser } from '../services/userService';
import { installFetchMock } from './helpers/mock-fetch';
import { clearStoredToken, seedStoredToken, validToken } from './helpers/mock-token';

const payload: CreateUserPayload = {
  nome: 'Ana',
  sobrenome: 'Silva',
  email: 'ana@example.com',
  senha: 'segredo123',
  documento: '12345678900',
  tipoPessoa: 'CPF',
};

beforeEach(() => {
  seedStoredToken(validToken());
});

afterEach(() => {
  clearStoredToken();
});

describe('createUser', () => {
  it('envia POST JSON para /usuario e retorna data', async () => {
    const usuario = { id: 7, nome: 'Ana', email: 'ana@example.com' };
    const fetchMock = installFetchMock([
      { match: '/usuario', status: 201, body: { success: true, message: 'Criado', data: usuario } },
    ]);

    const resultado = await createUser(payload);

    expect(resultado).toEqual(usuario);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/usuario`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(init?.body))).toEqual(payload);
    fetchMock.restore();
  });

  it('usa o primeiro item de erros da API', async () => {
    installFetchMock([
      {
        match: '/usuario',
        status: 422,
        body: { erros: ['Email já cadastrado'], message: 'Mensagem genérica' },
      },
    ]);

    await expect(createUser(payload)).rejects.toThrow('Email já cadastrado');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([
      { match: '/usuario', status: 400, body: { message: 'Senha fraca demais' } },
    ]);

    await expect(createUser(payload)).rejects.toThrow('Senha fraca demais');
  });

  it('usa mensagem padrão quando a API não informa nada', async () => {
    installFetchMock([{ match: '/usuario', status: 500, body: {} }]);

    await expect(createUser(payload)).rejects.toThrow(
      'Erro ao criar conta. Tente novamente.'
    );
  });

  it('traduz falha de conexão em mensagem amigável', async () => {
    const previousFetch = globalThis.fetch;
    Object.assign(globalThis, {
      fetch: jest.fn(async () => {
        throw new TypeError('Network request failed');
      }),
    });

    try {
      await expect(createUser(payload)).rejects.toThrow(
        'Houve um erro ao realizar essa operação. Tente novamente.'
      );
    } finally {
      Object.assign(globalThis, { fetch: previousFetch });
    }
  });
});
