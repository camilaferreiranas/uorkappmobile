import AsyncStorage from '@react-native-async-storage/async-storage';
import { limparUsuario, obterUsuario, salvarUsuario } from '../services/storageService';

const usuario = { id: 7, nome: 'Ana Souza', email: 'ana@exemplo.com' };

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('salvarUsuario', () => {
  it('serializa o usuário em JSON sob a chave usuario', async () => {
    await salvarUsuario(usuario);

    expect(await AsyncStorage.getItem('usuario')).toBe(JSON.stringify(usuario));
  });

  it('sobrescreve o usuário salvo anteriormente', async () => {
    await salvarUsuario(usuario);
    await salvarUsuario({ id: 8, nome: 'Bruno Lima' });

    expect(await obterUsuario()).toEqual({ id: 8, nome: 'Bruno Lima' });
  });

  it('aceita estruturas aninhadas', async () => {
    const complexo = { id: 1, enderecos: [{ rua: 'Rua A', numero: 10 }], ativo: true };

    await salvarUsuario(complexo);

    expect(await obterUsuario()).toEqual(complexo);
  });
});

describe('obterUsuario', () => {
  it('retorna null quando não há usuário salvo', async () => {
    await expect(obterUsuario()).resolves.toBeNull();
  });

  it('retorna null quando o valor salvo é vazio', async () => {
    await AsyncStorage.setItem('usuario', '');

    await expect(obterUsuario()).resolves.toBeNull();
  });

  it('retorna o objeto serializado salvo', async () => {
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));

    await expect(obterUsuario()).resolves.toEqual(usuario);
  });

  it('faz roundtrip com salvarUsuario', async () => {
    await salvarUsuario(usuario);

    await expect(obterUsuario()).resolves.toEqual(usuario);
  });
});

describe('limparUsuario', () => {
  it('remove o usuário salvo', async () => {
    await salvarUsuario(usuario);

    await limparUsuario();

    expect(await AsyncStorage.getItem('usuario')).toBeNull();
    await expect(obterUsuario()).resolves.toBeNull();
  });

  it('não falha quando não há usuário salvo', async () => {
    await expect(limparUsuario()).resolves.toBeUndefined();
  });

  it('mantém outras chaves intactas', async () => {
    await AsyncStorage.setItem('outra-chave', 'valor');
    await salvarUsuario(usuario);

    await limparUsuario();

    expect(await AsyncStorage.getItem('outra-chave')).toBe('valor');
  });
});
