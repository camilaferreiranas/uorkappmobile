import { API_URL } from '../services/api_url';
import {
  aceitarProposta,
  avaliarCliente,
  avaliarPrestador,
  buscarContatoWhatsApp,
  buscarDemandasDoPrestador,
  buscarDetalheDemanda,
  buscarHistoricoDoCliente,
  buscarMinhasPropostas,
  buscarResumoPrestador,
  confirmarConclusao,
  enviarProposta,
  naoConfirmarConclusao,
  recusarProposta,
  solicitarConclusao,
} from '../services/propostaService';
import { installFetchMock } from './helpers/mock-fetch';
import type { FetchRoute } from './helpers/mock-fetch';
import { clearStoredToken, expiredToken, seedStoredToken, validToken } from './helpers/mock-token';

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

const proposta = {
  prestadorId: 5,
  tipoServico: 'Elétrica',
  descricao: 'Trocar a tomada da sala',
  localizacao: 'Rua A, 10',
  urgencia: 'HOJE' as const,
};

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  seedStoredToken(validToken({ accessToken: 'token-de-teste' }));
});

afterEach(() => {
  clearStoredToken();
});

describe('enviarProposta', () => {
  it('envia FormData com JWT e campos da proposta', async () => {
    const fetchMock = installFetchMock([
      { match: '/propostas', body: { success: true } },
    ]);

    await expect(enviarProposta(proposta)).resolves.toBeUndefined();

    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/propostas`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    const form = init?.body as FormData;
    expect(form.get('prestadorId')).toBe('5');
    expect(form.get('tipoServico')).toBe('Elétrica');
    expect(form.get('descricao')).toBe('Trocar a tomada da sala');
    expect(form.get('localizacao')).toBe('Rua A, 10');
    expect(form.get('urgencia')).toBe('HOJE');
    expect(form.get('foto')).toBeNull();
    fetchMock.restore();
  });

  it('anexa a foto quando informada', async () => {
    const fetchMock = installFetchMock([
      { match: '/propostas', body: { success: true } },
    ]);

    await enviarProposta({
      ...proposta,
      foto: { uri: 'file:///foto.jpg', nome: 'foto.jpg', contentType: 'image/jpeg' },
    });

    const form = fetchMock.calls[0].init?.body as FormData;
    expect(form.get('foto')).toBe('[object Object]');
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(
      '/propostas',
      'Não foi possível enviar a proposta.',
      () => enviarProposta(proposta)
    );
  });

  it('propaga falha de rede traduzida pelo request', async () => {
    Object.assign(globalThis, {
      fetch: jest.fn(async () => {
        throw new TypeError('Network request failed');
      }),
    });

    await expect(enviarProposta(proposta)).rejects.toThrow(
      'Houve um erro ao realizar essa operação. Tente novamente.'
    );
  });
});

describe('bloqueio de sessão', () => {
  const operacoes: Array<[string, () => Promise<unknown>]> = [
    ['enviarProposta', () => enviarProposta(proposta)],
    ['buscarResumoPrestador', () => buscarResumoPrestador()],
    ['buscarDemandasDoPrestador', () => buscarDemandasDoPrestador()],
    ['buscarHistoricoDoCliente', () => buscarHistoricoDoCliente()],
    ['buscarMinhasPropostas', () => buscarMinhasPropostas()],
    ['buscarContatoWhatsApp', () => buscarContatoWhatsApp(10)],
    ['aceitarProposta', () => aceitarProposta(10)],
    ['recusarProposta', () => recusarProposta(10)],
    ['solicitarConclusao', () => solicitarConclusao(10, 100)],
    ['confirmarConclusao', () => confirmarConclusao(10)],
    ['naoConfirmarConclusao', () => naoConfirmarConclusao(10)],
    ['avaliarCliente', () => avaliarCliente(10, 5)],
    [
      'avaliarPrestador',
      () => avaliarPrestador(10, { nota: 5, destaque: null, comentario: null }),
    ],
    ['buscarDetalheDemanda', () => buscarDetalheDemanda(10)],
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

describe('buscarResumoPrestador', () => {
  it('retorna os indicadores com URL e JWT', async () => {
    const indicadores = {
      novasDemandas: 3,
      emAndamento: 5,
      concluido: 2,
      faturamentoUltimos30Dias: 1250.5,
    };
    const fetchMock = installFetchMock([
      { match: '/propostas/prestador/resumo', body: { success: true, data: indicadores } },
    ]);

    await expect(buscarResumoPrestador()).resolves.toEqual(indicadores);

    expect(fetchMock.calls[0].url).toBe(`${API_URL}/propostas/prestador/resumo`);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('rejeita indicadores fora do formato', async () => {
    const invalidos = [
      {},
      { novasDemandas: 1.5, emAndamento: 2, concluido: 1, faturamentoUltimos30Dias: 10 },
      { novasDemandas: 1, emAndamento: 'dois', concluido: 1, faturamentoUltimos30Dias: 10 },
      { novasDemandas: 1, emAndamento: 2, concluido: 1, faturamentoUltimos30Dias: Infinity },
    ];

    for (const data of invalidos) {
      const fetchMock = installFetchMock([
        { match: '/propostas/prestador/resumo', body: { success: true, data } },
      ]);
      await expect(buscarResumoPrestador()).rejects.toThrow(
        'Os indicadores recebidos são inválidos. Tente novamente.'
      );
      fetchMock.restore();
    }
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(
      '/propostas/prestador/resumo',
      'Não foi possível carregar os indicadores.',
      () => buscarResumoPrestador()
    );
  });
});

type Listagem = [string, () => Promise<unknown>, string, string];

const listagens: Listagem[] = [
  [
    'buscarDemandasDoPrestador',
    () => buscarDemandasDoPrestador(),
    '/propostas/prestador/demandas',
    'Não foi possível carregar as demandas.',
  ],
  [
    'buscarHistoricoDoCliente',
    () => buscarHistoricoDoCliente(),
    '/propostas/cliente/historico',
    'Não foi possível carregar o histórico de serviços.',
  ],
  [
    'buscarMinhasPropostas',
    () => buscarMinhasPropostas(),
    '/propostas/cliente/minhas',
    'Não foi possível carregar suas propostas.',
  ],
];

describe.each(listagens)('%s', (_nome, executar, rota, mensagemPadrao) => {
  it('retorna a lista com URL e JWT', async () => {
    const dados = [{ propostaId: 10, titulo: 'Trocar lâmpada', status: 'PENDENTE' }];
    const fetchMock = installFetchMock([
      { match: rota, body: { success: true, data: dados } },
    ]);

    await expect(executar()).resolves.toEqual(dados);

    expect(fetchMock.calls[0].url).toBe(`${API_URL}${rota}`);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('retorna lista vazia quando data não é lista', async () => {
    installFetchMock([{ match: rota, body: { success: true, data: { lista: true } } }]);

    await expect(executar()).resolves.toEqual([]);
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(rota, mensagemPadrao, executar);
  });
});

describe('buscarContatoWhatsApp', () => {
  const contato = {
    nomePrestador: 'Ana Souza',
    mensagem: 'Olá! Aceitei sua proposta.',
    whatsappUrl: 'https://wa.me/5511999999999',
  };

  it('retorna os dados de contato com URL e JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/propostas/42/contato-whatsapp', body: { success: true, data: contato } },
    ]);

    await expect(buscarContatoWhatsApp(42)).resolves.toEqual(contato);

    expect(fetchMock.calls[0].url).toBe(`${API_URL}/propostas/42/contato-whatsapp`);
    expect(fetchMock.calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer token-de-teste',
    });
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(
      '/propostas/42/contato-whatsapp',
      'Não foi possível abrir a conversa com o prestador.',
      () => buscarContatoWhatsApp(42)
    );
  });
});

type AcaoSimples = [string, (id: number) => Promise<unknown>, string, string | undefined, string];

const acoesSimples: AcaoSimples[] = [
  ['aceitarProposta', aceitarProposta, '/aceitar', 'PATCH', 'Não foi possível aceitar a proposta.'],
  ['recusarProposta', recusarProposta, '/recusar', 'PATCH', 'Não foi possível recusar a proposta.'],
  [
    'confirmarConclusao',
    confirmarConclusao,
    '/confirmar-conclusao',
    'PATCH',
    'Não foi possível responder à conclusão.',
  ],
  [
    'naoConfirmarConclusao',
    naoConfirmarConclusao,
    '/nao-confirmar-conclusao',
    'PATCH',
    'Não foi possível responder à conclusão.',
  ],
  [
    'buscarDetalheDemanda',
    buscarDetalheDemanda,
    '/detalhe-demanda',
    undefined,
    'Não foi possível carregar a proposta.',
  ],
];

describe.each(acoesSimples)('%s', (_nome, executar, sufixo, metodo, mensagemPadrao) => {
  it('executa a requisição e retorna os dados', async () => {
    const dados = { id: 7, status: 'ACEITA' };
    const fetchMock = installFetchMock([
      { match: sufixo, body: { success: true, data: dados } },
    ]);

    await expect(executar(7)).resolves.toEqual(dados);

    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/propostas/7${sufixo}`);
    expect(init?.method).toBe(metodo);
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer token-de-teste' });
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(sufixo, mensagemPadrao, () => executar(7));
  });
});

type AcaoComBody = [string, (id: number) => Promise<unknown>, string, unknown, string];

const avaliacao = { nota: 5, destaque: 'Excelente trabalho', comentario: 'Recomendo' };

const acoesComBody: AcaoComBody[] = [
  [
    'solicitarConclusao',
    (id) => solicitarConclusao(id, 250),
    '/solicitar-conclusao',
    { valorCobrado: 250 },
    'Não foi possível solicitar a conclusão.',
  ],
  [
    'avaliarPrestador',
    (id) => avaliarPrestador(id, avaliacao),
    '/avaliar-prestador',
    avaliacao,
    'Não foi possível enviar a avaliação.',
  ],
];

describe.each(acoesComBody)('%s', (_nome, executar, sufixo, corpo, mensagemPadrao) => {
  it('envia JSON com JWT e retorna os dados', async () => {
    const dados = { id: 7, propostaId: 7 };
    const fetchMock = installFetchMock([
      { match: sufixo, body: { success: true, data: dados } },
    ]);

    await expect(executar(7)).resolves.toEqual(dados);

    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/propostas/7${sufixo}`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-de-teste',
    });
    expect(JSON.parse(String(init?.body))).toEqual(corpo);
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(sufixo, mensagemPadrao, () => executar(7));
  });
});

describe('avaliarCliente', () => {
  it('envia a nota com JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/propostas/7/avaliar-cliente', body: { success: true } },
    ]);

    await expect(avaliarCliente(7, 4)).resolves.toBeUndefined();

    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/propostas/7/avaliar-cliente`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-de-teste',
    });
    expect(JSON.parse(String(init?.body))).toEqual({ nota: 4 });
    fetchMock.restore();
  });

  it('erro da API usa erros, message ou padrão', async () => {
    await conferirRamosDeErro(
      '/propostas/7/avaliar-cliente',
      'Não foi possível avaliar o cliente.',
      () => avaliarCliente(7, 4)
    );
  });
});
