import { act } from 'react-test-renderer';
import { AppState } from 'react-native';

import {
  buscarNotificacoes,
  buscarNotificacoesCliente,
  marcarNotificacaoComoLida,
  type Notificacao,
} from '../services/notificacaoService';
import { getToken } from '../services/token-storage';
import {
  consumirUltimoToqueEmPush,
  observarMensagemPushEmPrimeiroPlano,
  observarRenovacaoPushToken,
  observarToqueEmPush,
  registrarPushTokenAtual,
} from '../services/push-notification-service';
import { NotificationProvider, useNotifications } from '../contexts/notification-context';
import { flushAsync, renderWithProvider } from './helpers/render-hook';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn(function Client() {
    return {
      activate: jest.fn(),
      deactivate: jest.fn(async () => undefined),
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    };
  }),
}));

jest.mock('../services/notificacaoService', () => ({
  buscarNotificacoes: jest.fn(),
  buscarNotificacoesCliente: jest.fn(),
  marcarNotificacaoComoLida: jest.fn(),
}));

jest.mock('../services/token-storage', () => ({
  getToken: jest.fn(),
}));

jest.mock('../services/push-notification-service', () => ({
  registrarPushTokenAtual: jest.fn(async () => 'fcm-token'),
  removerPushTokenAtual: jest.fn(async () => undefined),
  observarRenovacaoPushToken: jest.fn(() => jest.fn()),
  observarMensagemPushEmPrimeiroPlano: jest.fn(() => jest.fn()),
  observarToqueEmPush: jest.fn(() => ({ remove: jest.fn() })),
  consumirUltimoToqueEmPush: jest.fn(async () => undefined),
}));

let mockUser: { id: number } | null = null;
jest.mock('../contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({ user: mockUser })),
}));

const stompMock = jest.requireMock('@stomp/stompjs') as {
  Client: jest.Mock & { mock: { calls: unknown[][]; results: { value: any }[] } };
};
const serviceMock = {
  buscarNotificacoes: jest.mocked(buscarNotificacoes),
  buscarNotificacoesCliente: jest.mocked(buscarNotificacoesCliente),
  marcarNotificacaoComoLida: jest.mocked(marcarNotificacaoComoLida),
  getToken: jest.mocked(getToken),
  registrarPushTokenAtual: jest.mocked(registrarPushTokenAtual),
  observarRenovacaoPushToken: jest.mocked(observarRenovacaoPushToken),
  observarMensagemPushEmPrimeiroPlano: jest.mocked(observarMensagemPushEmPrimeiroPlano),
  observarToqueEmPush: jest.mocked(observarToqueEmPush),
  consumirUltimoToqueEmPush: jest.mocked(consumirUltimoToqueEmPush),
};
const routerMock = jest.requireMock('expo-router') as { useRouter: jest.Mock };
let mockRouter = { push: jest.fn() };
let appStateListeners: Array<(state: string) => void> = [];

beforeAll(() => {
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    appStateListeners.push(handler as (state: string) => void);
    return { remove: jest.fn() };
  });
});

function criarNotificacao(id: number, overrides: Partial<Notificacao> = {}): Notificacao {
  return {
    id,
    titulo: `Notificação ${id}`,
    mensagem: 'Você tem uma novidade',
    lida: false,
    dataCriacao: '2026-01-01T12:00:00.000Z',
    propostaId: 1,
    demandaId: null,
    ...overrides,
  };
}

const desmontagens: Array<() => void> = [];

function montar() {
  const { result, unmount } = renderWithProvider(NotificationProvider, useNotifications);
  desmontagens.push(unmount);
  return result;
}

function ultimoClienteConfig() {
  const calls = stompMock.Client.mock.calls;
  return calls[calls.length - 1][0] as {
    connectHeaders: Record<string, string>;
    onConnect: () => void;
    onDisconnect: () => void;
    onWebSocketClose: () => void;
    onStompError: () => void;
    onWebSocketError: () => void;
  };
}

function ultimaInstancia() {
  const results = stompMock.Client.mock.results;
  return results[results.length - 1].value as {
    activate: jest.Mock;
    deactivate: jest.Mock;
    subscribe: jest.Mock;
  };
}

function destino(nome: string): (message: { body: string }) => void {
  const instance = ultimaInstancia();
  const call = instance.subscribe.mock.calls.find(([dest]) => dest === nome);
  if (!call) throw new Error(`assinatura não encontrada: ${nome}`);
  return call[1] as (message: { body: string }) => void;
}

beforeEach(() => {
  mockUser = { id: 1 };
  mockRouter = { push: jest.fn() };
  appStateListeners = [];
  stompMock.Client.mockClear();
  serviceMock.buscarNotificacoes.mockReset().mockResolvedValue({ naoLidas: 0, notificacoes: [] });
  serviceMock.buscarNotificacoesCliente
    .mockReset()
    .mockResolvedValue({ naoLidas: 0, notificacoes: [] });
  serviceMock.marcarNotificacaoComoLida.mockReset();
  serviceMock.getToken
    .mockReset()
    .mockResolvedValue({ accessToken: 'token-valido', expiresAt: Date.now() + 60_000 });
  serviceMock.registrarPushTokenAtual.mockReset().mockResolvedValue('fcm-token');
  serviceMock.observarRenovacaoPushToken.mockReset().mockReturnValue(jest.fn());
  serviceMock.observarMensagemPushEmPrimeiroPlano.mockReset().mockReturnValue(jest.fn());
  serviceMock.observarToqueEmPush
    .mockReset()
    .mockReturnValue({ remove: jest.fn() } as never);
  serviceMock.consumirUltimoToqueEmPush.mockReset().mockResolvedValue(undefined);
  routerMock.useRouter
    .mockReset()
    .mockImplementation(() => mockRouter);
});

afterEach(() => {
  while (desmontagens.length > 0) {
    desmontagens.pop()?.();
  }
});

describe('NotificationProvider - sessão ausente', () => {
  it('mantém listas vazias, sem conexão e sem registrar push quando não há usuário', async () => {
    mockUser = null;
    const result = montar();
    await flushAsync();

    expect(result.current.notificacoesCliente).toEqual([]);
    expect(result.current.notificacoesPrestador).toEqual([]);
    expect(result.current.conectado).toBe(false);
    expect(stompMock.Client).not.toHaveBeenCalled();
    expect(serviceMock.registrarPushTokenAtual).not.toHaveBeenCalled();
    expect(serviceMock.buscarNotificacoesCliente).not.toHaveBeenCalled();
  });

  it('lança erro quando o hook é usado fora do provider', () => {
    expect(() => renderWithProvider(({ children }: { children: React.ReactNode }) => <>{children}</>, useNotifications)).toThrow(
      'useNotifications deve ser usado dentro de NotificationProvider.'
    );
  });
});

describe('NotificationProvider - conexão e sincronização', () => {
  it('registra push, conecta via STOMP e sincroniza as listas com o token da sessão', async () => {
    serviceMock.buscarNotificacoesCliente.mockResolvedValue({
      naoLidas: 1,
      notificacoes: [criarNotificacao(1)],
    });
    serviceMock.buscarNotificacoes.mockResolvedValue({
      naoLidas: 2,
      notificacoes: [criarNotificacao(2), criarNotificacao(3)],
    });

    const result = montar();
    await flushAsync();
    await flushAsync();

    expect(serviceMock.registrarPushTokenAtual).toHaveBeenCalledTimes(1);
    expect(serviceMock.consumirUltimoToqueEmPush).toHaveBeenCalledTimes(1);
    expect(serviceMock.observarToqueEmPush).toHaveBeenCalledTimes(1);
    expect(serviceMock.observarRenovacaoPushToken).toHaveBeenCalledTimes(1);
    expect(serviceMock.observarMensagemPushEmPrimeiroPlano).toHaveBeenCalledTimes(1);

    const config = ultimoClienteConfig();
    expect(config.connectHeaders.Authorization).toBe('Bearer token-valido');
    expect(ultimaInstancia().activate).toHaveBeenCalledTimes(1);
    expect(serviceMock.buscarNotificacoesCliente).toHaveBeenCalled();
    expect(serviceMock.buscarNotificacoes).toHaveBeenCalled();
    expect(result.current.conectado).toBe(false);

    act(() => config.onConnect());

    expect(result.current.conectado).toBe(true);
    expect(result.current.notificacoesCliente.map((n) => n.id)).toEqual([1]);
    expect(result.current.notificacoesPrestador.map((n) => n.id)).toEqual([2, 3]);
    expect(result.current.naoLidasCliente).toBe(1);
    expect(result.current.naoLidasPrestador).toBe(2);
  });

  it('não conecta quando o token da sessão está expirado', async () => {
    serviceMock.getToken.mockResolvedValue({
      accessToken: 'token-velho',
      expiresAt: Date.now() - 1000,
    });

    montar();
    await flushAsync();

    expect(stompMock.Client).not.toHaveBeenCalled();
    expect(serviceMock.buscarNotificacoesCliente).not.toHaveBeenCalled();
  });

  it('encerra a conexão e zera o status ao desmontar', async () => {
    const result = montar();
    await flushAsync();
    act(() => ultimoClienteConfig().onConnect());
    expect(result.current.conectado).toBe(true);

    desmontagens.pop()?.();

    expect(ultimaInstancia().deactivate).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['onDisconnect', (c: ReturnType<typeof ultimoClienteConfig>) => c.onDisconnect()],
    ['onWebSocketClose', (c: ReturnType<typeof ultimoClienteConfig>) => c.onWebSocketClose()],
    ['onStompError', (c: ReturnType<typeof ultimoClienteConfig>) => c.onStompError()],
    ['onWebSocketError', (c: ReturnType<typeof ultimoClienteConfig>) => c.onWebSocketError()],
  ])('%s marca a conexão como desconectada', async (_nome, disparar) => {
    const result = montar();
    await flushAsync();
    act(() => ultimoClienteConfig().onConnect());
    expect(result.current.conectado).toBe(true);

    act(() => disparar(ultimoClienteConfig()));
    expect(result.current.conectado).toBe(false);
  });

  it('sincroniza novamente quando o app volta ao primeiro plano', async () => {
    montar();
    await flushAsync();
    expect(serviceMock.buscarNotificacoesCliente).toHaveBeenCalledTimes(1);
    expect(appStateListeners).toHaveLength(1);

    await act(async () => {
      appStateListeners.forEach((cb) => cb('active'));
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    expect(serviceMock.buscarNotificacoesCliente).toHaveBeenCalledTimes(2);
    expect(serviceMock.buscarNotificacoes).toHaveBeenCalledTimes(2);
  });
});

describe('NotificationProvider - mensagens em tempo real', () => {
  it('adiciona notificações unificadas por contexto, ignora inválidas e atualiza duplicadas', async () => {
    const result = montar();
    await flushAsync();
    act(() => ultimoClienteConfig().onConnect());

    const unificada = destino('/user/queue/notificacoes');
    act(() => {
      unificada({ body: JSON.stringify({ contexto: 'CLIENTE', notificacao: criarNotificacao(10) }) });
      unificada({ body: JSON.stringify({ contexto: 'PRESTADOR', notificacao: criarNotificacao(20) }) });
      unificada({ body: 'json-inválido' });
      unificada({ body: JSON.stringify({ contexto: 'OUTRO', notificacao: criarNotificacao(30) }) });
      unificada({ body: JSON.stringify({ contexto: 'CLIENTE', notificacao: null }) });
      unificada({
        body: JSON.stringify({
          contexto: 'CLIENTE',
          notificacao: criarNotificacao(10, { lida: true }),
        }),
      });
    });

    expect(result.current.notificacoesCliente.map((n) => [n.id, n.lida])).toEqual([[10, true]]);
    expect(result.current.notificacoesPrestador.map((n) => n.id)).toEqual([20]);
    expect(result.current.naoLidasCliente).toBe(0);
    expect(result.current.naoLidasPrestador).toBe(1);
  });

  it('mantém compatibilidade com os destinos legados de cliente e prestador', async () => {
    const result = montar();
    await flushAsync();
    act(() => ultimoClienteConfig().onConnect());

    const legadoCliente = destino('/user/queue/notificacoes/cliente');
    const legadoPrestador = destino('/user/queue/notificacoes/prestador');

    act(() => {
      legadoCliente({ body: JSON.stringify(criarNotificacao(40)) });
      legadoCliente({ body: JSON.stringify({ id: 'nao-numerico' }) });
      legadoPrestador({ body: JSON.stringify(criarNotificacao(50)) });
      legadoPrestador({ body: 'quebrado' });
    });

    expect(result.current.notificacoesCliente.map((n) => n.id)).toEqual([40]);
    expect(result.current.notificacoesPrestador.map((n) => n.id)).toEqual([50]);
  });
});

describe('NotificationProvider - push e navegação', () => {
  it('navega conforme o contexto informado no toque do push', async () => {
    montar();
    await flushAsync();

    const [abrirPush] = serviceMock.observarToqueEmPush.mock.calls[0] as [
      (data: Record<string, unknown>) => void
    ];

    act(() => abrirPush({ contexto: 'PRESTADOR' }));
    act(() => abrirPush({ contexto: 'CLIENTE' }));
    act(() => abrirPush({}));

    expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/professional-notifications');
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/client-notifications');
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });

  it('remove os ouvintes de push ao desmontar', async () => {
    const remover = jest.fn();
    serviceMock.observarToqueEmPush.mockReturnValue({ remove: remover } as never);
    const removerRenovacao = jest.fn();
    serviceMock.observarRenovacaoPushToken.mockReturnValue(removerRenovacao);
    const removerPrimeiroPlano = jest.fn();
    serviceMock.observarMensagemPushEmPrimeiroPlano.mockReturnValue(removerPrimeiroPlano);

    const result = montar();
    await flushAsync();
    desmontagens.pop()?.();

    expect(remover).toHaveBeenCalledTimes(1);
    expect(removerRenovacao).toHaveBeenCalledTimes(1);
    expect(removerPrimeiroPlano).toHaveBeenCalledTimes(1);
    void result;
  });
});

describe('NotificationProvider - sincronizar e marcar como lida', () => {
  it('sincronizarCliente e sincronizarPrestador substituem as listas', async () => {
    serviceMock.buscarNotificacoesCliente.mockResolvedValue({
      naoLidas: 1,
      notificacoes: [criarNotificacao(60)],
    });
    serviceMock.buscarNotificacoes.mockResolvedValue({
      naoLidas: 1,
      notificacoes: [criarNotificacao(70)],
    });

    const result = montar();
    await flushAsync();

    await act(async () => {
      await result.current.sincronizarCliente();
      await result.current.sincronizarPrestador();
    });

    expect(result.current.notificacoesCliente.map((n) => n.id)).toEqual([60]);
    expect(result.current.notificacoesPrestador.map((n) => n.id)).toEqual([70]);
  });

  it('marcarComoLida atualiza a lista do contexto correspondente', async () => {
    serviceMock.buscarNotificacoesCliente.mockResolvedValue({
      naoLidas: 1,
      notificacoes: [criarNotificacao(80), criarNotificacao(81)],
    });
    serviceMock.buscarNotificacoes.mockResolvedValue({
      naoLidas: 1,
      notificacoes: [criarNotificacao(90)],
    });
    serviceMock.marcarNotificacaoComoLida.mockResolvedValue(
      criarNotificacao(80, { lida: true })
    );

    const result = montar();
    await flushAsync();

    let retornada: Notificacao | undefined;
    await act(async () => {
      retornada = await result.current.marcarComoLida('cliente', 80);
    });

    expect(serviceMock.marcarNotificacaoComoLida).toHaveBeenCalledWith(80);
    expect(retornada?.lida).toBe(true);
    expect(result.current.notificacoesCliente.map((n) => [n.id, n.lida])).toEqual([
      [80, true],
      [81, false],
    ]);
    expect(result.current.naoLidasCliente).toBe(1);

    serviceMock.marcarNotificacaoComoLida.mockResolvedValue(
      criarNotificacao(90, { lida: true })
    );
    await act(async () => {
      await result.current.marcarComoLida('prestador', 90);
    });

    expect(result.current.notificacoesPrestador.map((n) => [n.id, n.lida])).toEqual([
      [90, true],
    ]);
    expect(result.current.naoLidasPrestador).toBe(0);
  });
});
