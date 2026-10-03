import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import {
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken as getFirebaseToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';

import { API_URL } from '../services/api_url';
import type * as PushNotificationService from '../services/push-notification-service';
import { installFetchMock, type FetchMock } from './helpers/mock-fetch';
import { flushAsync } from './helpers/render-hook';
import { clearStoredToken, seedStoredToken, validToken } from './helpers/mock-token';

const {
  consumirUltimoToqueEmPush,
  observarMensagemPushEmPrimeiroPlano,
  observarRenovacaoPushToken,
  observarToqueEmPush,
  registrarPushTokenAtual,
  removerPushTokenAtual,
} = require('../services/push-notification-service.ts') as typeof PushNotificationService;

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  getMessaging: jest.fn(() => ({ id: 'messaging' })),
  getToken: jest.fn(async () => 'fcm-token'),
  deleteToken: jest.fn(async () => undefined),
  getInitialNotification: jest.fn(async () => null),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
}));

type SecureStoreMock = {
  __store: Map<string, string>;
  __reset: () => void;
};

const PUSH_TOKEN_KEY = 'uork_fcm_push_token';
const PUSH_URL = `${API_URL}/notificacoes/push-tokens`;

function secureStore(): SecureStoreMock {
  return jest.requireMock('expo-secure-store') as SecureStoreMock;
}

function seedPushToken(token: string) {
  secureStore().__store.set(PUSH_TOKEN_KEY, token);
}

function lerPushToken(): string | null {
  return secureStore().__store.get(PUSH_TOKEN_KEY) ?? null;
}

let fetchMock: FetchMock;
let osSpy: jest.ReplaceProperty<'ios' | 'android' | 'web' | 'macos' | 'windows'>;
let versionSpy: jest.SpyInstance;
let requestPermissionSpy: jest.SpyInstance;

beforeEach(() => {
  clearStoredToken();
  secureStore().__reset();
  fetchMock = installFetchMock([
    { match: '/notificacoes/push-tokens', status: 200, body: {} },
  ]);
  osSpy = jest.replaceProperty(Platform, 'OS', 'android');
  versionSpy = jest
    .spyOn(Platform, 'Version', 'get')
    .mockReturnValue('34' as never);
  requestPermissionSpy = jest
    .spyOn(PermissionsAndroid, 'request')
    .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  jest.mocked(getMessaging).mockReturnValue({ id: 'messaging' } as never);
  jest.mocked(getFirebaseToken).mockResolvedValue('fcm-token');
  jest.mocked(deleteToken).mockResolvedValue(undefined);
  jest.mocked(getInitialNotification).mockResolvedValue(null);
  jest.mocked(onMessage).mockReturnValue(jest.fn());
  jest.mocked(onNotificationOpenedApp).mockReturnValue(jest.fn());
  jest.mocked(onTokenRefresh).mockReturnValue(jest.fn());
});

afterEach(() => {
  osSpy.restore();
  versionSpy.mockRestore();
  requestPermissionSpy.mockRestore();
  fetchMock.restore();
});

describe('registrarPushTokenAtual', () => {
  it('retorna null fora do Android', async () => {
    osSpy.restore();
    osSpy = jest.replaceProperty(Platform, 'OS', 'ios');

    await expect(registrarPushTokenAtual()).resolves.toBeNull();
    expect(getFirebaseToken).not.toHaveBeenCalled();
    expect(fetchMock.mock).not.toHaveBeenCalled();
  });

  it('retorna null quando a permissão é negada (Android 13+)', async () => {
    requestPermissionSpy.mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    await expect(registrarPushTokenAtual()).resolves.toBeNull();
    expect(notifee.createChannel).not.toHaveBeenCalled();
    expect(fetchMock.mock).not.toHaveBeenCalled();
  });

  it('solicita permissão, cria o canal, envia o token e o persiste', async () => {
    seedStoredToken(validToken());
    await expect(registrarPushTokenAtual()).resolves.toBe('fcm-token');

    expect(requestPermissionSpy).toHaveBeenCalledWith(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    expect(notifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'propostas', importance: 4 })
    );
    expect(getFirebaseToken).toHaveBeenCalledTimes(1);
    expect(fetchMock.calls[0]).toEqual({
      url: PUSH_URL,
      init: expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-valido',
        }),
      }),
    });
    expect(lerPushToken()).toBe('fcm-token');
  });

  it('pula a permissão em Android anterior ao 13', async () => {
    versionSpy.mockReturnValue('30' as never);
    seedStoredToken(validToken());

    await expect(registrarPushTokenAtual()).resolves.toBe('fcm-token');
    expect(requestPermissionSpy).not.toHaveBeenCalled();
  });

  it('propaga erro do backend e não persiste o token', async () => {
    seedStoredToken(validToken());
    fetchMock.restore();
    fetchMock = installFetchMock([
      { match: '/notificacoes/push-tokens', status: 500, body: {} },
    ]);

    await expect(registrarPushTokenAtual()).rejects.toThrow(
      'Não foi possível atualizar as notificações do aparelho.'
    );
    expect(lerPushToken()).toBeNull();
  });

  it('lança "Sessão expirada" quando não há token de acesso', async () => {
    await expect(registrarPushTokenAtual()).rejects.toThrow(
      'Sessão expirada. Entre novamente.'
    );
    expect(fetchMock.mock).not.toHaveBeenCalled();
  });
});

describe('removerPushTokenAtual', () => {
  it('retorna imediatamente fora do Android', async () => {
    osSpy.restore();
    osSpy = jest.replaceProperty(Platform, 'OS', 'ios');

    await expect(removerPushTokenAtual()).resolves.toBeUndefined();
    expect(fetchMock.mock).not.toHaveBeenCalled();
  });

  it('retorna quando não há token FCM persistido', async () => {
    await expect(removerPushTokenAtual()).resolves.toBeUndefined();
    expect(fetchMock.mock).not.toHaveBeenCalled();
  });

  it('remove no backend com o accessToken informado e limpa o armazenamento', async () => {
    seedPushToken('fcm-antigo');

    await expect(removerPushTokenAtual('token-direto')).resolves.toBeUndefined();

    expect(fetchMock.calls[0].init?.method).toBe('DELETE');
    expect(
      (fetchMock.calls[0].init?.headers as Record<string, string>).Authorization
    ).toBe('Bearer token-direto');
    expect(jest.mocked(deleteToken)).toHaveBeenCalledTimes(1);
    expect(lerPushToken()).toBeNull();
  });

  it('usa o token da sessão quando nenhum accessToken é informado', async () => {
    seedStoredToken(validToken());
    seedPushToken('fcm-antigo');

    await removerPushTokenAtual();

    expect(
      (fetchMock.calls[0].init?.headers as Record<string, string>).Authorization
    ).toBe('Bearer token-valido');
  });

  it('limpa o token local mesmo quando o backend falha e propaga o erro', async () => {
    fetchMock.restore();
    fetchMock = installFetchMock([
      { match: '/notificacoes/push-tokens', status: 500, body: {} },
    ]);
    seedPushToken('fcm-antigo');
    seedStoredToken(validToken());

    await expect(removerPushTokenAtual()).rejects.toThrow(
      'Não foi possível atualizar as notificações do aparelho.'
    );
    expect(jest.mocked(deleteToken)).toHaveBeenCalledTimes(1);
    expect(lerPushToken()).toBeNull();
  });
});

describe('observarRenovacaoPushToken', () => {
  it('retorna um no-op fora do Android', () => {
    osSpy.restore();
    osSpy = jest.replaceProperty(Platform, 'OS', 'ios');

    const remover = observarRenovacaoPushToken();
    expect(() => remover()).not.toThrow();
    expect(onTokenRefresh).not.toHaveBeenCalled();
  });

  it('registra o ouvinte e reenvia o token renovado ao backend', async () => {
    seedStoredToken(validToken());
    observarRenovacaoPushToken();

    expect(onTokenRefresh).toHaveBeenCalledTimes(1);
    const [, callback] = jest.mocked(onTokenRefresh).mock.calls[0];
    await callback('token-renovado');
    await flushAsync();

    expect(fetchMock.calls[0].init?.method).toBe('POST');
    expect(lerPushToken()).toBe('token-renovado');
  });

  it('avisa no console quando a renovação falha', async () => {
    fetchMock.restore();
    fetchMock = installFetchMock([
      { match: '/notificacoes/push-tokens', status: 500, body: {} },
    ]);
    seedStoredToken(validToken());
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    observarRenovacaoPushToken();
    const [, callback] = jest.mocked(onTokenRefresh).mock.calls[0];
    await callback('token-renovado');
    await flushAsync();

    expect(warn).toHaveBeenCalledWith(
      'Não foi possível renovar o token FCM:',
      expect.any(Error)
    );
    warn.mockRestore();
  });
});

describe('observarMensagemPushEmPrimeiroPlano', () => {
  it('retorna um no-op fora do Android', () => {
    osSpy.restore();
    osSpy = jest.replaceProperty(Platform, 'OS', 'ios');

    expect(observarMensagemPushEmPrimeiroPlano()).toEqual(expect.any(Function));
    expect(onMessage).not.toHaveBeenCalled();
  });

  it('exibe a notificação recebida com título padrão quando ausente', async () => {
    observarMensagemPushEmPrimeiroPlano();

    const [, callback] = jest.mocked(onMessage).mock.calls[0];
    await callback({ notification: { body: 'Você tem uma proposta' } } as never);

    expect(notifee.createChannel).toHaveBeenCalledTimes(1);
    expect(notifee.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Uork',
        body: 'Você tem uma proposta',
        android: expect.objectContaining({ channelId: 'channel-id' }),
      })
    );
  });

  it('usa o título e os dados enviados pela origem', async () => {
    observarMensagemPushEmPrimeiroPlano();

    const [, callback] = jest.mocked(onMessage).mock.calls[0];
    await callback({
      notification: { title: 'Nova demanda', body: 'Olá' },
      data: { contexto: 'PRESTADOR' },
    } as never);

    expect(notifee.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Nova demanda',
        data: { contexto: 'PRESTADOR' },
      })
    );
  });
});

describe('observarToqueEmPush', () => {
  it('retorna um remover no-op fora do Android', () => {
    osSpy.restore();
    osSpy = jest.replaceProperty(Platform, 'OS', 'ios');

    const { remove } = observarToqueEmPush(jest.fn());
    expect(() => remove()).not.toThrow();
    expect(onNotificationOpenedApp).not.toHaveBeenCalled();
    expect(notifee.onForegroundEvent).not.toHaveBeenCalled();
  });

  it('encaminha o toque do Firebase e do notifee e remove os ouvintes', () => {
    const callback = jest.fn();
    const removerNotifee = jest.fn();
    jest.mocked(notifee.onForegroundEvent).mockReturnValue(removerNotifee);

    const { remove } = observarToqueEmPush(callback);

    const [, firebaseCallback] = jest.mocked(onNotificationOpenedApp).mock.calls[0];
    firebaseCallback({ data: { rota: 'a' } } as never);
    firebaseCallback({} as never);

    const [notifeeCallback] = jest.mocked(notifee.onForegroundEvent).mock.calls[0];
    notifeeCallback({
      type: EventType.PRESS,
      detail: { notification: { data: { rota: 'b' } } },
    });
    notifeeCallback({ type: EventType.DISMISSED, detail: { notification: {} } });
    notifeeCallback({ type: EventType.PRESS, detail: {} });

    expect(callback).toHaveBeenNthCalledWith(1, { rota: 'a' });
    expect(callback).toHaveBeenNthCalledWith(2, {});
    expect(callback).toHaveBeenNthCalledWith(3, { rota: 'b' });
    expect(callback).toHaveBeenNthCalledWith(4, {});
    expect(callback).toHaveBeenCalledTimes(4);

    remove();
    expect(jest.mocked(onNotificationOpenedApp).mock.results[0].value).toHaveBeenCalledTimes(
      1
    );
    expect(removerNotifee).toHaveBeenCalledTimes(1);
  });
});

describe('consumirUltimoToqueEmPush', () => {
  it('ignora fora do Android', async () => {
    osSpy.restore();
    osSpy = jest.replaceProperty(Platform, 'OS', 'ios');
    const callback = jest.fn();

    await consumirUltimoToqueEmPush(callback);
    expect(callback).not.toHaveBeenCalled();
    expect(getInitialNotification).not.toHaveBeenCalled();
  });

  it('prioriza a notificação inicial do Firebase', async () => {
    const callback = jest.fn();
    jest.mocked(getInitialNotification).mockResolvedValue({
      data: { origem: 'firebase' },
    } as never);
    jest.mocked(notifee.getInitialNotification).mockResolvedValue({
      notification: { data: { origem: 'notifee' } },
    } as never);

    await consumirUltimoToqueEmPush(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ origem: 'firebase' });
  });

  it('usa a notificação do notifee quando o Firebase não tem nada', async () => {
    const callback = jest.fn();
    jest.mocked(getInitialNotification).mockResolvedValue(null);
    jest.mocked(notifee.getInitialNotification).mockResolvedValue({
      notification: { data: undefined },
    } as never);

    await consumirUltimoToqueEmPush(callback);

    expect(callback).toHaveBeenCalledWith({});
  });

  it('não chama o callback quando não há notificação pendente', async () => {
    const callback = jest.fn();
    jest.mocked(getInitialNotification).mockResolvedValue(null);
    jest.mocked(notifee.getInitialNotification).mockResolvedValue(null);

    await consumirUltimoToqueEmPush(callback);

    expect(callback).not.toHaveBeenCalled();
  });
});
