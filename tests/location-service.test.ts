import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  obterLocalizacaoAtual,
  obterLocalizacaoDetalhadaAtual,
} from '../services/locationService';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 'balanced' },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

const LOCALIZACAO_KEY = 'ultima_localizacao';

const coordenadasApi = { latitude: -23.5605, longitude: -46.6558 };
const cacheValido = { latitude: -23.55, longitude: -46.63, capturadaEm: 0 };

function locationMock() {
  return jest.requireMock('expo-location') as {
    requestForegroundPermissionsAsync: jest.Mock;
    getCurrentPositionAsync: jest.Mock;
    reverseGeocodeAsync: jest.Mock;
  };
}

async function semearCache(localizacao: object | string): Promise<void> {
  const valor = typeof localizacao === 'string' ? localizacao : JSON.stringify(localizacao);
  await AsyncStorage.setItem(LOCALIZACAO_KEY, valor);
}

let warnSpy: jest.SpyInstance;

beforeEach(async () => {
  await AsyncStorage.clear();
  const location = locationMock();
  location.requestForegroundPermissionsAsync.mockReset();
  location.getCurrentPositionAsync.mockReset();
  location.reverseGeocodeAsync.mockReset();
  location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  location.getCurrentPositionAsync.mockResolvedValue({ coords: coordenadasApi });
  location.reverseGeocodeAsync.mockResolvedValue([]);
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('obterLocalizacaoAtual', () => {
  it('retorna o cache enquanto a captura tiver menos de 15 minutos', async () => {
    await semearCache({ ...cacheValido, capturadaEm: Date.now() });
    const location = locationMock();

    await expect(obterLocalizacaoAtual()).resolves.toEqual({
      latitude: cacheValido.latitude,
      longitude: cacheValido.longitude,
    });
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('ignora cache expirado, consulta a API e grava a nova captura', async () => {
    await semearCache({ ...cacheValido, capturadaEm: Date.now() - 16 * 60 * 1000 });
    const location = locationMock();

    await expect(obterLocalizacaoAtual()).resolves.toEqual(coordenadasApi);

    expect(location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 'balanced' });
    const salvo = JSON.parse(String(await AsyncStorage.getItem(LOCALIZACAO_KEY)));
    expect(salvo).toMatchObject({
      latitude: coordenadasApi.latitude,
      longitude: coordenadasApi.longitude,
    });
    expect(salvo.capturadaEm).toBeGreaterThan(Date.now() - 5000);
  });

  it('ignora cache com JSON inválido e consulta a API do Location', async () => {
    await semearCache('{json-quebrado');
    const location = locationMock();

    await expect(obterLocalizacaoAtual()).resolves.toEqual(coordenadasApi);
    expect(location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('ignora cache com coordenadas fora dos limites aceitos', async () => {
    await semearCache({ latitude: 999, longitude: -46.63, capturadaEm: Date.now() });
    const location = locationMock();

    await expect(obterLocalizacaoAtual()).resolves.toEqual(coordenadasApi);
    expect(location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('retorna null quando a permissão é negada', async () => {
    const location = locationMock();
    location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await expect(obterLocalizacaoAtual()).resolves.toBeNull();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('retorna null e avisa quando a API do Location falha', async () => {
    const erro = new Error('serviço de localização indisponível');
    locationMock().getCurrentPositionAsync.mockRejectedValue(erro);

    await expect(obterLocalizacaoAtual()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Não foi possível obter a localização atual:',
      erro
    );
  });

  it('retorna null e avisa quando a solicitação de permissão falha', async () => {
    const erro = new Error('permissão indisponível');
    locationMock().requestForegroundPermissionsAsync.mockRejectedValue(erro);

    await expect(obterLocalizacaoAtual()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Não foi possível obter a localização atual:',
      erro
    );
  });

  it('mantém as coordenadas mesmo quando a gravação do cache falha', async () => {
    const falha = new Error('disco cheio');
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(falha);

    await expect(obterLocalizacaoAtual()).resolves.toEqual(coordenadasApi);
    expect(warnSpy).toHaveBeenCalledWith(
      'Não foi possível salvar a localização no dispositivo:',
      falha
    );
  });
});

describe('obterLocalizacaoDetalhadaAtual', () => {
  beforeEach(async () => {
    await semearCache({ ...cacheValido, capturadaEm: Date.now() });
  });

  it('monta a descrição a partir do endereço devolvido pelo geocoder', async () => {
    locationMock().reverseGeocodeAsync.mockResolvedValue([
      {
        street: 'Rua das Flores',
        streetNumber: '123',
        district: 'Centro',
        city: 'São Paulo',
        region: 'SP',
        postalCode: '01000-000',
      },
    ]);

    await expect(obterLocalizacaoDetalhadaAtual()).resolves.toEqual({
      latitude: cacheValido.latitude,
      longitude: cacheValido.longitude,
      descricao: 'Rua das Flores, 123, Centro, São Paulo, SP, 01000-000',
    });
    expect(locationMock().reverseGeocodeAsync).toHaveBeenCalledWith({
      latitude: cacheValido.latitude,
      longitude: cacheValido.longitude,
    });
  });

  it('descarta partes vazias ou em branco do endereço', async () => {
    locationMock().reverseGeocodeAsync.mockResolvedValue([
      {
        street: 'Avenida Central',
        streetNumber: '   ',
        district: null,
        city: 'Curitiba',
        region: undefined,
        postalCode: '',
      },
    ]);

    const resultado = await obterLocalizacaoDetalhadaAtual();

    expect(resultado?.descricao).toBe('Avenida Central, Curitiba');
  });

  it('usa as coordenadas como descrição quando o geocoder não retorna endereço', async () => {
    locationMock().reverseGeocodeAsync.mockResolvedValue([]);

    await expect(obterLocalizacaoDetalhadaAtual()).resolves.toEqual({
      latitude: cacheValido.latitude,
      longitude: cacheValido.longitude,
      descricao: '-23.550000, -46.630000',
    });
  });

  it('usa as coordenadas como descrição quando o endereço vem todo vazio', async () => {
    locationMock().reverseGeocodeAsync.mockResolvedValue([{}]);

    const resultado = await obterLocalizacaoDetalhadaAtual();

    expect(resultado?.descricao).toBe('-23.550000, -46.630000');
  });

  it('usa as coordenadas como descrição quando o geocoder falha', async () => {
    locationMock().reverseGeocodeAsync.mockRejectedValue(new Error('geocoder fora do ar'));

    await expect(obterLocalizacaoDetalhadaAtual()).resolves.toEqual({
      latitude: cacheValido.latitude,
      longitude: cacheValido.longitude,
      descricao: '-23.550000, -46.630000',
    });
  });

  it('retorna null quando não há localização disponível', async () => {
    await AsyncStorage.clear();
    locationMock().requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await expect(obterLocalizacaoDetalhadaAtual()).resolves.toBeNull();
    expect(locationMock().reverseGeocodeAsync).not.toHaveBeenCalled();
  });
});

describe('caminho web (localStorage)', () => {
  const memoria = new Map<string, string>();
  let descriptorOS: PropertyDescriptor | undefined;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memoria.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memoria.set(key, value);
        },
        removeItem: (key: string) => {
          memoria.delete(key);
        },
      },
    });
    descriptorOS = Object.getOwnPropertyDescriptor(Platform, 'OS');
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  afterAll(() => {
    if (descriptorOS) {
      Object.defineProperty(Platform, 'OS', descriptorOS);
    } else {
      Reflect.deleteProperty(Platform, 'OS');
    }
    Reflect.deleteProperty(globalThis, 'localStorage');
    memoria.clear();
  });

  beforeEach(() => {
    memoria.clear();
  });

  it('lê a localização em cache do localStorage sem usar a API do Location', async () => {
    memoria.set(
      LOCALIZACAO_KEY,
      JSON.stringify({ latitude: -23.5, longitude: -46.6, capturadaEm: Date.now() })
    );
    const location = locationMock();

    await expect(obterLocalizacaoAtual()).resolves.toEqual({
      latitude: -23.5,
      longitude: -46.6,
    });
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('grava a localização capturada no localStorage', async () => {
    const location = locationMock();
    location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 10.5, longitude: 20.25 },
    });

    await expect(obterLocalizacaoAtual()).resolves.toEqual({
      latitude: 10.5,
      longitude: 20.25,
    });

    const salvo = JSON.parse(String(memoria.get(LOCALIZACAO_KEY)));
    expect(salvo).toMatchObject({ latitude: 10.5, longitude: 20.25 });
    expect(typeof salvo.capturadaEm).toBe('number');
    expect(location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('usa as coordenadas como descrição quando o endereço vem vazio', async () => {
    memoria.set(
      LOCALIZACAO_KEY,
      JSON.stringify({ latitude: -23.55, longitude: -46.63, capturadaEm: Date.now() })
    );
    locationMock().reverseGeocodeAsync.mockResolvedValue([]);

    const resultado = await obterLocalizacaoDetalhadaAtual();

    expect(resultado?.descricao).toBe('-23.550000, -46.630000');
  });
});
