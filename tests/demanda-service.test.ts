import { API_URL } from '../services/api_url';
import {
  buscarCandidaturasDaDemanda,
  buscarDemandaDisponivel,
  buscarDemandasDisponiveis,
  buscarMinhasDemandas,
  enviarCandidatura,
  publicarDemanda,
  selecionarCandidatura,
} from '../services/demandaService';
import { installFetchMock } from './helpers/mock-fetch';
import { clearStoredToken, expiredToken, seedStoredToken, validToken } from './helpers/mock-token';

const pagina = {
  content: [
    {
      id: 23,
      titulo: 'Trocar lâmpada',
      fotos: [],
      nomeCliente: 'Cliente',
      clienteId: 1,
      categoriaId: 2,
      categoria: 'Elétrica',
      descricao: 'Trocar lâmpada do teto',
      localizacao: 'Rua A',
      latitude: null,
      longitude: null,
      urgencia: 'NORMAL' as const,
      orcamento: null,
      status: 'ABERTA' as const,
      criadoEm: '2026-01-01T00:00:00',
      candidaturaId: null,
      statusCandidatura: null,
      mediaAvaliacoesCliente: null,
      totalAvaliacoesCliente: null,
    },
  ],
  number: 1,
  totalPages: 3,
  totalElements: 42,
  last: false,
};

beforeEach(() => {
  seedStoredToken(validToken({ accessToken: 'token-de-teste' }));
});

afterEach(() => {
  clearStoredToken();
});

describe('buscarDemandasDisponiveis (lista paginada)', () => {
  it('usa endpoint paginado, JWT e sinal de cancelamento', async () => {
    const fetchMock = installFetchMock([
      { match: '/demandas/disponiveis', body: { success: true, data: pagina } },
    ]);
    const controller = new AbortController();

    const resultado = await buscarDemandasDisponiveis(1, 20, controller.signal);

    expect(resultado).toEqual(pagina);
    expect(fetchMock.calls).toHaveLength(1);
    expect(fetchMock.calls[0].url).toBe(
      `${API_URL}/demandas/disponiveis?page=1&size=20&ordenacao=RECENTES`
    );
    expect(fetchMock.calls[0].init?.method).toBe('GET');
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    expect(fetchMock.calls[0].init?.signal).toBe(controller.signal);
    fetchMock.restore();
  });

  it('lista vazia é um resultado válido', async () => {
    const vazia = { content: [], number: 0, totalPages: 0, totalElements: 0, last: true };
    installFetchMock([{ match: '/demandas/disponiveis', body: { success: true, data: vazia } }]);

    await expect(buscarDemandasDisponiveis()).resolves.toEqual(vazia);
  });

  it('aplica filtro de categoria e ordenação na URL', async () => {
    const fetchMock = installFetchMock([
      { match: '/demandas/disponiveis', body: { success: true, data: pagina } },
    ]);

    await buscarDemandasDisponiveis(2, 10, undefined, 7, 'MAIOR_ORCAMENTO');

    expect(fetchMock.calls[0].url).toBe(
      `${API_URL}/demandas/disponiveis?page=2&size=10&categoriaId=7&ordenacao=MAIOR_ORCAMENTO`
    );
    fetchMock.restore();
  });

  it('bloqueia sessão ausente ou expirada antes da requisição', async () => {
    for (const token of [null, expiredToken()] as const) {
      if (token === null) clearStoredToken();
      else seedStoredToken(token);
      const fetchMock = installFetchMock([]);

      await expect(buscarDemandasDisponiveis()).rejects.toThrow('Sessão expirada. Entre novamente.');
      await expect(buscarDemandaDisponivel(1)).rejects.toThrow('Sessão expirada. Entre novamente.');
      expect(fetchMock.calls).toHaveLength(0);
      fetchMock.restore();
    }
  });

  it('valida paginação localmente', async () => {
    const fetchMock = installFetchMock([]);
    for (const [page, size] of [
      [-1, 20],
      [0.5, 20],
      [0, 0],
      [0, 51],
      [0, 2.5],
    ] as const) {
      await expect(buscarDemandasDisponiveis(page, size)).rejects.toThrow('Paginação inválida.');
    }
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('valida categoria localmente', async () => {
    const fetchMock = installFetchMock([]);
    for (const categoria of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      await expect(buscarDemandasDisponiveis(0, 20, undefined, categoria)).rejects.toThrow(
        'Selecione uma categoria válida.'
      );
    }
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('erro da API prioriza erros de validação', async () => {
    installFetchMock([
      {
        match: '/demandas/disponiveis',
        status: 403,
        body: { erros: ['Cadastro precisa estar ativo'], message: 'Genéricico' },
      },
    ]);

    await expect(buscarDemandasDisponiveis()).rejects.toThrow('Cadastro precisa estar ativo');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([
      { match: '/demandas/disponiveis', status: 500, body: { message: 'Indisponível no momento' } },
    ]);

    await expect(buscarDemandasDisponiveis()).rejects.toThrow('Indisponível no momento');
  });

  it('resposta não JSON tem erro compreensível', async () => {
    installFetchMock([{ match: '/demandas/disponiveis', status: 500, invalidJson: true }]);

    await expect(buscarDemandasDisponiveis()).rejects.toThrow(
      'Não foi possível carregar as demandas disponíveis.'
    );
  });

  it('rejeita success false', async () => {
    installFetchMock([
      { match: '/demandas/disponiveis', body: { success: false, message: 'Indisponível', data: pagina } },
    ]);

    await expect(buscarDemandasDisponiveis()).rejects.toThrow('Indisponível');
  });

  it('rejeita formato incompatível de página', async () => {
    installFetchMock([
      { match: '/demandas/disponiveis', body: { success: true, data: [] } },
    ]);

    await expect(buscarDemandasDisponiveis()).rejects.toThrow(
      'Resposta inválida ao carregar as demandas disponíveis.'
    );
  });

  it('propaga erro de rede', async () => {
    Object.assign(globalThis, {
      fetch: jest.fn(async () => {
        throw new TypeError('Network request failed');
      }),
    });

    await expect(buscarDemandasDisponiveis()).rejects.toThrow('Network request failed');
  });
});

describe('buscarDemandaDisponivel (detalhe)', () => {
  it('detalhe aceita demanda sem fotos e sem orçamento', async () => {
    const demanda = { ...pagina.content[0], orcamento: null };
    const fetchMock = installFetchMock([
      { match: '/demandas/disponiveis/23', body: { success: true, data: demanda } },
    ]);

    await expect(buscarDemandaDisponivel(23)).resolves.toEqual(demanda);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('propaga demanda indisponível', async () => {
    const fetchMock = installFetchMock([
      { match: '/demandas/disponiveis/23', status: 404, body: { message: 'Demanda não disponível' } },
    ]);

    await expect(buscarDemandaDisponivel(23)).rejects.toThrow('Demanda não disponível');
    expect(fetchMock.calls[0].url).toBe(`${API_URL}/demandas/disponiveis/23`);
    fetchMock.restore();
  });

  it('ID inválido não faz requisição', async () => {
    const fetchMock = installFetchMock([]);
    for (const id of [0, -1, NaN, 1.2, Number.MAX_SAFE_INTEGER + 1]) {
      await expect(buscarDemandaDisponivel(id)).rejects.toThrow('Demanda inválida.');
    }
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });
});

describe('publicarDemanda', () => {
  const payload = {
    categoriaId: 2,
    titulo: 'Preciso de ajuda',
    descricao: 'Descrição',
    localizacao: 'Rua B, 10',
    urgencia: 'HOJE' as const,
  };

  it('publica com FormData e JWT', async () => {
    const demanda = { id: 30, titulo: payload.titulo };
    const fetchMock = installFetchMock([
      { match: '/demandas', status: 201, body: { success: true, data: demanda } },
    ]);

    const resultado = await publicarDemanda(payload);

    expect(resultado).toEqual(demanda);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/demandas`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    const form = init?.body as FormData;
    expect(form.get('titulo')).toBe('Preciso de ajuda');
    expect(form.get('urgencia')).toBe('HOJE');
    expect(form.get('latitude')).toBeNull();
    fetchMock.restore();
  });

  it('inclui localização e orçamento opcionais', async () => {
    const fetchMock = installFetchMock([
      { match: '/demandas', body: { success: true, data: { id: 31 } } },
    ]);

    await publicarDemanda({
      ...payload,
      latitude: -23.5,
      longitude: -46.6,
      orcamento: 250,
      fotos: [{ uri: 'file:///f.jpg', nome: 'f.jpg', contentType: 'image/jpeg' }],
    });

    const form = fetchMock.calls[0].init?.body as FormData;
    expect(form.get('latitude')).toBe('-23.5');
    expect(form.get('longitude')).toBe('-46.6');
    expect(form.get('orcamento')).toBe('250');
    expect(form.get('fotos')).toContain('[object Object]');
    fetchMock.restore();
  });

  it('bloqueia sessão expirada', async () => {
    seedStoredToken(expiredToken());
    const fetchMock = installFetchMock([]);

    await expect(publicarDemanda(payload)).rejects.toThrow('Sessão expirada. Entre novamente.');
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('usa erros de validação da API', async () => {
    installFetchMock([
      { match: '/demandas', status: 422, body: { erros: ['Título muito curto'] } },
    ]);

    await expect(publicarDemanda(payload)).rejects.toThrow('Título muito curto');
  });

  it('usa message quando não há data', async () => {
    installFetchMock([
      { match: '/demandas', status: 400, body: { success: false, message: 'Limite atingido' } },
    ]);

    await expect(publicarDemanda(payload)).rejects.toThrow('Limite atingido');
  });

  it('resposta não JSON usa mensagem padrão', async () => {
    installFetchMock([{ match: '/demandas', status: 500, invalidJson: true }]);

    await expect(publicarDemanda(payload)).rejects.toThrow(
      'Não foi possível publicar a demanda.'
    );
  });
});

describe('buscarMinhasDemandas', () => {
  it('retorna a lista das demandas do usuário', async () => {
    const fetchMock = installFetchMock([
      { match: '/demandas/minhas', body: { success: true, data: [pagina.content[0]] } },
    ]);

    const demandas = await buscarMinhasDemandas();

    expect(demandas).toHaveLength(1);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('bloqueia sessão expirada', async () => {
    clearStoredToken();

    await expect(buscarMinhasDemandas()).rejects.toThrow('Sessão expirada. Entre novamente.');
  });

  it('usa erros da API', async () => {
    installFetchMock([
      { match: '/demandas/minhas', status: 403, body: { erros: ['Sem acesso'] } },
    ]);

    await expect(buscarMinhasDemandas()).rejects.toThrow('Sem acesso');
  });

  it('usa message da API', async () => {
    installFetchMock([
      { match: '/demandas/minhas', status: 500, body: { message: 'Falhou' } },
    ]);

    await expect(buscarMinhasDemandas()).rejects.toThrow('Falhou');
  });

  it('resposta não JSON usa mensagem padrão', async () => {
    installFetchMock([{ match: '/demandas/minhas', status: 500, invalidJson: true }]);

    await expect(buscarMinhasDemandas()).rejects.toThrow(
      'Não foi possível carregar suas demandas.'
    );
  });

  it('rejeita data que não é lista', async () => {
    installFetchMock([
      { match: '/demandas/minhas', body: { success: true, data: { lista: true } } },
    ]);

    await expect(buscarMinhasDemandas()).rejects.toThrow(
      'Não foi possível carregar suas demandas.'
    );
  });
});

describe('enviarCandidatura', () => {
  it('prestador envia candidatura com valor, mensagem e JWT', async () => {
    const candidatura = {
      id: 81,
      demandaId: 23,
      valor: 350,
      mensagem: 'Posso fazer amanhã',
      status: 'PENDENTE' as const,
    };
    const fetchMock = installFetchMock([
      { match: '/candidaturas', status: 201, body: { success: true, data: candidatura } },
    ]);

    const resultado = await enviarCandidatura(23, 350, ' Posso fazer amanhã ');

    expect(resultado).toEqual(candidatura);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/demandas/23/candidaturas`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    expect(JSON.parse(String(init?.body))).toEqual({
      valor: 350,
      mensagem: 'Posso fazer amanhã',
    });
    fetchMock.restore();
  });

  it('mensagem vazia é enviada como null', async () => {
    const fetchMock = installFetchMock([
      { match: '/candidaturas', body: { success: true, data: { id: 1 } } },
    ]);

    await enviarCandidatura(23, 100, '   ');

    expect(JSON.parse(String(fetchMock.calls[0].init?.body))).toEqual({
      valor: 100,
      mensagem: null,
    });
    fetchMock.restore();
  });

  it('valida candidatura localmente antes de consultar a API', async () => {
    const fetchMock = installFetchMock([]);

    await expect(enviarCandidatura(0, 100, '')).rejects.toThrow('Demanda inválida.');
    await expect(enviarCandidatura(23, 0, '')).rejects.toThrow(
      'Informe um valor válido para a proposta.'
    );
    await expect(enviarCandidatura(23, NaN, '')).rejects.toThrow(
      'Informe um valor válido para a proposta.'
    );
    await expect(enviarCandidatura(23, 100, 'x'.repeat(501))).rejects.toThrow(
      'A mensagem deve ter no máximo 500 caracteres.'
    );
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('bloqueia sessão expirada', async () => {
    seedStoredToken(expiredToken());
    const fetchMock = installFetchMock([]);

    await expect(enviarCandidatura(23, 100, 'oi')).rejects.toThrow(
      'Sessão expirada. Entre novamente.'
    );
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    installFetchMock([{ match: '/candidaturas', status: 409, body: { erros: ['Já candidatou'] } }]);
    await expect(enviarCandidatura(23, 100, 'oi')).rejects.toThrow('Já candidatou');

    installFetchMock([{ match: '/candidaturas', status: 400, body: { message: 'Fora do prazo' } }]);
    await expect(enviarCandidatura(23, 100, 'oi')).rejects.toThrow('Fora do prazo');

    installFetchMock([{ match: '/candidaturas', status: 500, invalidJson: true }]);
    await expect(enviarCandidatura(23, 100, 'oi')).rejects.toThrow(
      'Não foi possível enviar sua candidatura.'
    );
  });
});

describe('buscarCandidaturasDaDemanda', () => {
  const dados = {
    demandaId: 23,
    titulo: 'Trocar lâmpada',
    status: 'ABERTA' as const,
    candidaturas: [],
  };

  it('cliente carrega candidaturas da própria demanda', async () => {
    const fetchMock = installFetchMock([
      { match: '/demandas/23/candidaturas', body: { success: true, data: dados } },
    ]);
    const controller = new AbortController();

    await expect(buscarCandidaturasDaDemanda(23, controller.signal)).resolves.toEqual(dados);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/demandas/23/candidaturas`);
    expect(init?.signal).toBe(controller.signal);
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    fetchMock.restore();
  });

  it('rejeita ID inválido sem requisição', async () => {
    const fetchMock = installFetchMock([]);
    await expect(buscarCandidaturasDaDemanda(0)).rejects.toThrow('Demanda inválida.');
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('rejeita resposta sem lista de candidaturas', async () => {
    installFetchMock([
      { match: '/demandas/23/candidaturas', body: { success: true, data: { candidaturas: null } } },
    ]);

    await expect(buscarCandidaturasDaDemanda(23)).rejects.toThrow(
      'Resposta inválida ao carregar as candidaturas.'
    );
  });

  it('erro da API usa erros, message ou padrão', async () => {
    installFetchMock([
      { match: '/demandas/23/candidaturas', status: 403, body: { erros: ['Demanda fechada'] } },
    ]);
    await expect(buscarCandidaturasDaDemanda(23)).rejects.toThrow('Demanda fechada');

    installFetchMock([
      { match: '/demandas/23/candidaturas', status: 500, body: { message: 'Falhou' } },
    ]);
    await expect(buscarCandidaturasDaDemanda(23)).rejects.toThrow('Falhou');

    installFetchMock([
      { match: '/demandas/23/candidaturas', status: 500, invalidJson: true },
    ]);
    await expect(buscarCandidaturasDaDemanda(23)).rejects.toThrow(
      'Não foi possível carregar as candidaturas.'
    );
  });
});

describe('selecionarCandidatura', () => {
  it('cliente seleciona uma candidatura pelo endpoint da demanda', async () => {
    const candidatura = { id: 81, demandaId: 23, status: 'ACEITA' as const };
    const fetchMock = installFetchMock([
      { match: '/selecionar', body: { success: true, data: candidatura } },
    ]);

    await expect(selecionarCandidatura(23, 81)).resolves.toEqual(candidatura);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/demandas/23/candidaturas/81/selecionar`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    fetchMock.restore();
  });

  it('valida IDs localmente', async () => {
    const fetchMock = installFetchMock([]);
    await expect(selecionarCandidatura(23, 0)).rejects.toThrow('Candidatura inválida.');
    await expect(selecionarCandidatura(0, 81)).rejects.toThrow('Candidatura inválida.');
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    installFetchMock([{ match: '/selecionar', status: 409, body: { erros: ['Já selecionado'] } }]);
    await expect(selecionarCandidatura(23, 81)).rejects.toThrow('Já selecionado');

    installFetchMock([{ match: '/selecionar', status: 400, body: { message: 'Em análise' } }]);
    await expect(selecionarCandidatura(23, 81)).rejects.toThrow('Em análise');

    installFetchMock([{ match: '/selecionar', status: 500, invalidJson: true }]);
    await expect(selecionarCandidatura(23, 81)).rejects.toThrow(
      'Não foi possível selecionar este prestador.'
    );
  });
});
