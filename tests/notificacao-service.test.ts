import { API_URL } from '../services/api_url';
import {
  buscarNotificacoes,
  buscarNotificacoesCliente,
  marcarNotificacaoComoLida,
} from '../services/notificacaoService';
import { installFetchMock } from './helpers/mock-fetch';
import { clearStoredToken, expiredToken, seedStoredToken, validToken } from './helpers/mock-token';

const SESSAO_EXPIRADA = 'Sessão expirada. Entre novamente.';

const dados = {
  naoLidas: 2,
  notificacoes: [
    {
      id: 5,
      titulo: 'Nova proposta',
      mensagem: 'Você recebeu uma proposta',
      lida: false,
      dataCriacao: '2026-01-01T10:00:00',
      propostaId: 12,
      demandaId: 3,
    },
  ],
};

const notificacaoLida = { ...dados.notificacoes[0], lida: true };

beforeEach(() => {
  seedStoredToken(validToken({ accessToken: 'tk' }));
});

afterEach(() => {
  clearStoredToken();
});

describe('guarda de sessão', () => {
  it('bloqueia sessão ausente ou expirada antes da requisição', async () => {
    for (const token of [null, expiredToken()] as const) {
      if (token === null) clearStoredToken();
      else seedStoredToken(token);
      const fetchMock = installFetchMock([]);

      await expect(buscarNotificacoes()).rejects.toThrow(SESSAO_EXPIRADA);
      await expect(buscarNotificacoesCliente()).rejects.toThrow(SESSAO_EXPIRADA);
      await expect(marcarNotificacaoComoLida(5)).rejects.toThrow(SESSAO_EXPIRADA);
      expect(fetchMock.calls).toHaveLength(0);
      fetchMock.restore();
    }
  });
});

describe('buscarNotificacoes', () => {
  it('carrega as notificações com endpoint e JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/notificacoes', body: { success: true, data: dados } },
    ]);

    await expect(buscarNotificacoes()).resolves.toEqual(dados);
    expect(fetchMock.calls[0].url).toBe(`${API_URL}/notificacoes`);
    expect(fetchMock.calls[0].init?.method).toBeUndefined();
    expect(fetchMock.calls[0].init?.headers).toMatchObject({ Authorization: 'Bearer tk' });
    fetchMock.restore();
  });

  it('erro da API prioriza erros de validação', async () => {
    installFetchMock([
      { match: '/notificacoes', status: 403, body: { erros: ['Sem permissão'], message: 'Genérico' } },
    ]);

    await expect(buscarNotificacoes()).rejects.toThrow('Sem permissão');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([{ match: '/notificacoes', status: 500, body: { message: 'Indisponível' } }]);

    await expect(buscarNotificacoes()).rejects.toThrow('Indisponível');
  });

  it('resposta não JSON usa mensagem padrão', async () => {
    installFetchMock([{ match: '/notificacoes', status: 500, invalidJson: true }]);

    await expect(buscarNotificacoes()).rejects.toThrow(
      'Não foi possível carregar as notificações.'
    );
  });
});

describe('buscarNotificacoesCliente', () => {
  it('carrega as notificações do cliente com endpoint e JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/notificacoes/cliente', body: { success: true, data: dados } },
    ]);

    await expect(buscarNotificacoesCliente()).resolves.toEqual(dados);
    expect(fetchMock.calls[0].url).toBe(`${API_URL}/notificacoes/cliente`);
    expect(fetchMock.calls[0].init?.method).toBeUndefined();
    expect(fetchMock.calls[0].init?.headers).toMatchObject({ Authorization: 'Bearer tk' });
    fetchMock.restore();
  });

  it('erro da API prioriza erros de validação', async () => {
    installFetchMock([
      {
        match: '/notificacoes/cliente',
        status: 403,
        body: { erros: ['Cadastro inativo'], message: 'Genérico' },
      },
    ]);

    await expect(buscarNotificacoesCliente()).rejects.toThrow('Cadastro inativo');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([
      { match: '/notificacoes/cliente', status: 500, body: { message: 'Falhou' } },
    ]);

    await expect(buscarNotificacoesCliente()).rejects.toThrow('Falhou');
  });

  it('resposta não JSON usa mensagem padrão', async () => {
    installFetchMock([{ match: '/notificacoes/cliente', status: 500, invalidJson: true }]);

    await expect(buscarNotificacoesCliente()).rejects.toThrow(
      'Não foi possível carregar as notificações do cliente.'
    );
  });
});

describe('marcarNotificacaoComoLida', () => {
  it('envia PATCH para o endpoint da notificação com JWT', async () => {
    const fetchMock = installFetchMock([
      { match: '/notificacoes/5/lida', body: { success: true, data: notificacaoLida } },
    ]);

    await expect(marcarNotificacaoComoLida(5)).resolves.toEqual(notificacaoLida);
    const { url, init } = fetchMock.calls[0];
    expect(url).toBe(`${API_URL}/notificacoes/5/lida`);
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer tk' });
    fetchMock.restore();
  });

  it('erro da API prioriza erros de validação', async () => {
    installFetchMock([
      { match: '/notificacoes/5/lida', status: 404, body: { erros: ['Não encontrada'], message: 'Genérico' } },
    ]);

    await expect(marcarNotificacaoComoLida(5)).rejects.toThrow('Não encontrada');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([
      { match: '/notificacoes/5/lida', status: 500, body: { message: 'Serviço fora do ar' } },
    ]);

    await expect(marcarNotificacaoComoLida(5)).rejects.toThrow('Serviço fora do ar');
  });

  it('resposta não JSON usa mensagem padrão', async () => {
    installFetchMock([{ match: '/notificacoes/5/lida', status: 500, invalidJson: true }]);

    await expect(marcarNotificacaoComoLida(5)).rejects.toThrow(
      'Não foi possível atualizar a notificação.'
    );
  });
});
