import { API_URL } from '../services/api_url';
import {
  atualizarLocalizacaoPrestador,
  buscarPaginaPrestadoresProximos,
  buscarPerfilPrestador,
  buscarPrestadoresCategoria,
  buscarPrestadoresPorTermo,
  buscarPrestadoresProximos,
  cadastrarPrestador,
  verificarCadastroPrestador,
} from '../services/prestadorService';
import { obterLocalizacaoAtual } from '../services/locationService';
import { installFetchMock } from './helpers/mock-fetch';
import type { FetchRoute } from './helpers/mock-fetch';
import { clearStoredToken, expiredToken, seedStoredToken, validToken } from './helpers/mock-token';

jest.mock('../services/locationService', () => ({
  obterLocalizacaoAtual: jest.fn(),
  obterLocalizacaoDetalhadaAtual: jest.fn(),
}));

const mockObterLocalizacao = obterLocalizacaoAtual as jest.Mock;

const localizacao = { latitude: -23.5, longitude: -46.6 };

/** Verifica os ramos de mensagem de erro: erros, message e padrão. */
async function conferirRamosDeErro(
  rota: string,
  mensagemPadrao: string,
  executar: () => Promise<unknown>
): Promise<void> {
  const cenarios: Array<[FetchRoute, string]> = [
    [{ match: rota, status: 403, body: { erros: ['Sem acesso'] } }, 'Sem acesso'],
    [
      { match: rota, status: 400, body: { message: 'Operação não permitida' } },
      'Operação não permitida',
    ],
    [{ match: rota, status: 500, invalidJson: true }, mensagemPadrao],
  ];

  for (const [cenario, esperado] of cenarios) {
    const fetchMock = installFetchMock([cenario]);
    await expect(executar()).rejects.toThrow(esperado);
    fetchMock.restore();
  }
}

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  seedStoredToken(validToken({ accessToken: 'token-de-teste' }));
  mockObterLocalizacao.mockResolvedValue(null);
});

afterEach(() => {
  clearStoredToken();
});

describe('verificarCadastroPrestador', () => {
  it('retorna true quando a API confirma o cadastro', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores/me/status', body: { success: true, data: true } },
    ]);

    await expect(verificarCadastroPrestador()).resolves.toBe(true);

    expect(fetchMock.calls[0].url).toBe(`${API_URL}/prestadores/me/status`);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('retorna false quando data não é booleano true', async () => {
    for (const data of [false, 'true', 1, null]) {
      installFetchMock([
        { match: '/prestadores/me/status', body: { success: true, data } },
      ]);

      await expect(verificarCadastroPrestador()).resolves.toBe(false);
    }
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(
      '/prestadores/me/status',
      'Não foi possível verificar o cadastro profissional.',
      () => verificarCadastroPrestador()
    );
  });
});

describe('cadastrarPrestador', () => {
  const cadastro = {
    descricao: 'Eletricista há 10 anos',
    categoriasIds: [1, 2],
    endereco: {
      cep: '01001-000',
      rua: 'Praça da Sé',
      numero: '1',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  };

  it('envia o payload em JSON com JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores', body: { success: true } },
    ]);

    await expect(cadastrarPrestador(cadastro)).resolves.toBeUndefined();

    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/prestadores`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-de-teste',
    });
    expect(JSON.parse(String(init?.body))).toEqual(cadastro);
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(
      '/prestadores',
      'Não foi possível concluir o cadastro profissional.',
      () => cadastrarPrestador(cadastro)
    );
  });
});

describe('bloqueio de sessão', () => {
  const operacoes: Array<[string, () => Promise<unknown>]> = [
    ['verificarCadastroPrestador', () => verificarCadastroPrestador()],
    ['cadastrarPrestador', () => cadastrarPrestador(cadastroVazio())],
    ['buscarPrestadoresProximos', () => buscarPrestadoresProximos()],
    ['buscarPaginaPrestadoresProximos', () => buscarPaginaPrestadoresProximos()],
    ['buscarPrestadoresCategoria', () => buscarPrestadoresCategoria(7)],
    ['buscarPrestadoresPorTermo', () => buscarPrestadoresPorTermo('eletricista')],
    ['atualizarLocalizacaoPrestador', () => atualizarLocalizacaoPrestador()],
    ['buscarPerfilPrestador', () => buscarPerfilPrestador(9)],
  ];

  it.each(operacoes)('%s bloqueia sessão ausente ou expirada', async (_nome, executar) => {
    const fetchMock = installFetchMock([]);

    clearStoredToken();
    await expect(executar()).rejects.toThrow('Sessão expirada. Entre novamente.');

    seedStoredToken(expiredToken());
    await expect(executar()).rejects.toThrow('Sessão expirada. Entre novamente.');

    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });
});

function cadastroVazio() {
  return {
    descricao: '',
    categoriasIds: [],
    endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' },
  };
}

describe('buscarPaginaPrestadoresProximos', () => {
  const prestador = {
    id: 9,
    nome: 'Ana Souza',
    fotoPerfilUrl: null,
    categorias: ['Elétrica'],
    mediaAvaliacoes: 4.8,
    distanciaKm: 2.5,
  };

  it('monta a URL com paginação, localização e JWT', async () => {
    mockObterLocalizacao.mockResolvedValue(localizacao);
    const pagina = {
      content: [prestador],
      page: 2,
      size: 5,
      totalElements: 7,
      totalPages: 3,
      first: false,
      last: true,
    };
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: pagina } },
    ]);

    await expect(buscarPaginaPrestadoresProximos(2, 5)).resolves.toEqual(pagina);

    expect(fetchMock.calls[0].url).toBe(
      `${API_URL}/prestadores?page=2&size=5&latitude=-23.5&longitude=-46.6`
    );
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('omite latitude e longitude quando não há localização', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: { content: [] } } },
    ]);

    await buscarPaginaPrestadoresProximos();

    expect(fetchMock.calls[0].url).toBe(`${API_URL}/prestadores?page=0&size=10`);
    fetchMock.restore();
  });

  it('normaliza a página recebida com campos ausentes', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: {} } },
    ]);

    await expect(buscarPaginaPrestadoresProximos()).resolves.toEqual({
      content: [],
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    installFetchMock([
      {
        match: '/prestadores?',
        body: {
          success: true,
          data: { content: [], page: 1, size: 2, totalElements: 3, totalPages: 4, first: false, last: false },
        },
      },
    ]);
    await expect(buscarPaginaPrestadoresProximos()).resolves.toMatchObject({
      page: 1,
      size: 2,
      totalElements: 3,
      totalPages: 4,
      first: false,
      last: false,
    });
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão com status', async () => {
    await conferirRamosDeErro(
      '/prestadores?',
      'Erro ao buscar prestadores: 500',
      () => buscarPaginaPrestadoresProximos()
    );
  });
});

describe('buscarPrestadoresProximos', () => {
  it('retorna apenas o content da página', async () => {
    const prestadores = [{ id: 9, nome: 'Ana Souza' }];
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: { content: prestadores } } },
    ]);

    await expect(buscarPrestadoresProximos()).resolves.toEqual(prestadores);
    fetchMock.restore();
  });
});

describe('buscarPrestadoresCategoria', () => {
  it('filtra por categoria e localização na URL', async () => {
    mockObterLocalizacao.mockResolvedValue(localizacao);
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: { content: [] } } },
    ]);

    await buscarPrestadoresCategoria(7);

    expect(fetchMock.calls[0].url).toBe(
      `${API_URL}/prestadores?categoriaId=7&page=0&size=10&latitude=-23.5&longitude=-46.6`
    );
    fetchMock.restore();
  });
});

describe('buscarPrestadoresPorTermo', () => {
  it('envia o termo aparado na URL', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: { content: [] } } },
    ]);

    await buscarPrestadoresPorTermo('  eletricista  ', 1, 5);

    expect(fetchMock.calls[0].url).toBe(
      `${API_URL}/prestadores?page=1&size=5&busca=eletricista`
    );
    fetchMock.restore();
  });

  it('omite busca quando o termo está vazio', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores?', body: { success: true, data: { content: [] } } },
    ]);

    await buscarPrestadoresPorTermo('   ');

    expect(fetchMock.calls[0].url).toBe(`${API_URL}/prestadores?page=0&size=30`);
    fetchMock.restore();
  });
});

describe('atualizarLocalizacaoPrestador', () => {
  it('envia a localização em JSON com JWT', async () => {
    mockObterLocalizacao.mockResolvedValue(localizacao);
    const dados = { ...localizacao, atualizadaEm: '2026-01-01T00:00:00' };
    const fetchMock = installFetchMock([
      { match: '/prestadores/localizacao', body: { success: true, data: dados } },
    ]);

    await expect(atualizarLocalizacaoPrestador()).resolves.toEqual(dados);

    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/prestadores/localizacao`);
    expect(init?.method).toBe('PUT');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-de-teste',
    });
    expect(JSON.parse(String(init?.body))).toEqual(localizacao);
    fetchMock.restore();
  });

  it('sem localização pede permissão antes da requisição', async () => {
    const fetchMock = installFetchMock([]);

    await expect(atualizarLocalizacaoPrestador()).rejects.toThrow(
      'Permita o acesso à localização para aparecer para clientes próximos.'
    );
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    mockObterLocalizacao.mockResolvedValue(localizacao);

    await conferirRamosDeErro(
      '/prestadores/localizacao',
      'Não foi possível atualizar a localização profissional.',
      () => atualizarLocalizacaoPrestador()
    );
  });
});

describe('buscarPerfilPrestador', () => {
  const perfil = {
    id: 9,
    nome: 'Ana Souza',
    descricao: 'Eletricista',
    notaMedia: 4.8,
    servicos: [],
  };

  it('retorna o perfil com URL e JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores/9/perfil', body: { success: true, data: perfil } },
    ]);

    await expect(buscarPerfilPrestador(9)).resolves.toEqual(perfil);

    expect(fetchMock.calls[0].url).toBe(`${API_URL}/prestadores/9/perfil`);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('erro HTTP usa mensagem com o status', async () => {
    const fetchMock = installFetchMock([
      { match: '/prestadores/9/perfil', status: 404, body: {} },
    ]);

    await expect(buscarPerfilPrestador(9)).rejects.toThrow('Erro na requisição: 404');
    fetchMock.restore();
  });

  it('success false usa message', async () => {
    installFetchMock([
      {
        match: '/prestadores/9/perfil',
        body: { success: false, message: 'Perfil indisponível' },
      },
    ]);

    await expect(buscarPerfilPrestador(9)).rejects.toThrow('Perfil indisponível');
  });

  it('success false sem message usa mensagem padrão', async () => {
    installFetchMock([
      { match: '/prestadores/9/perfil', body: { success: false } },
    ]);

    await expect(buscarPerfilPrestador(9)).rejects.toThrow('Falha ao carregar perfil');
  });

  it('resposta não JSON propaga erro de parsing', async () => {
    installFetchMock([
      { match: '/prestadores/9/perfil', status: 200, invalidJson: true },
    ]);

    await expect(buscarPerfilPrestador(9)).rejects.toThrow('Unexpected token');
  });
});
