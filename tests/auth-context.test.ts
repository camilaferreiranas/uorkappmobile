import { act } from 'react-test-renderer';

import { ApiRequestError } from '../services/api';
import type {
  Endereco,
  GoogleAuthPayload,
  ProfilePhotoAsset,
  UpdateUserProfilePayload,
  UserProfile,
} from '../services/api';
import { AuthProvider, useAuth } from '../contexts/auth-context';
import { flushAsync, renderHook, renderWithProvider } from './helpers/render-hook';

jest.mock('../services/api', () => {
  const actual = jest.requireActual('../services/api');
  return {
    ...actual,
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserAddress: jest.fn(),
    uploadUserProfilePhoto: jest.fn(),
    removeUserProfilePhoto: jest.fn(),
  };
});

let mockTokenStore: { accessToken: string; expiresAt: number } | null = null;
let mockCachedUser: unknown = null;

jest.mock('../services/token-storage', () => ({
  getToken: jest.fn(async () => mockTokenStore),
  saveToken: jest.fn(async () => undefined),
  clearToken: jest.fn(async () => undefined),
}));

jest.mock('../services/storageService', () => ({
  salvarUsuario: jest.fn(async () => undefined),
  obterUsuario: jest.fn(async () => mockCachedUser),
  limparUsuario: jest.fn(async () => undefined),
}));

jest.mock('../services/push-notification-service', () => ({
  removerPushTokenAtual: jest.fn(async () => undefined),
}));

const apiMock = jest.requireMock('../services/api') as {
  login: jest.Mock;
  loginWithGoogle: jest.Mock;
  getUserProfile: jest.Mock;
  updateUserProfile: jest.Mock;
  updateUserAddress: jest.Mock;
  uploadUserProfilePhoto: jest.Mock;
  removeUserProfilePhoto: jest.Mock;
};

const tokenMock = jest.requireMock('../services/token-storage') as {
  getToken: jest.Mock;
  saveToken: jest.Mock;
  clearToken: jest.Mock;
};

const storageMock = jest.requireMock('../services/storageService') as {
  salvarUsuario: jest.Mock;
  obterUsuario: jest.Mock;
  limparUsuario: jest.Mock;
};

const pushMock = jest.requireMock('../services/push-notification-service') as {
  removerPushTokenAtual: jest.Mock;
};

type AuthValue = ReturnType<typeof useAuth>;

function criarPerfil(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 1,
    nome: 'Ana',
    sobrenome: 'Silva',
    email: 'ana@email.com',
    documento: '12345678900',
    telefone: '11999999999',
    tipoPessoa: 'CPF',
    endereco: {
      rua: 'Rua das Flores',
      numero: '10',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01000-000',
    },
    fotoPerfilUrl: null,
    totalServicosFinalizados: 0,
    mediaAvaliacoesCliente: 0,
    ...overrides,
  };
}

function tokenValido(accessToken = 'token-valido') {
  return { accessToken, expiresAt: Date.now() + 60 * 60 * 1000 };
}

function tokenExpirado(accessToken = 'token-expirado') {
  return { accessToken, expiresAt: Date.now() - 1000 };
}

function adiar<T>() {
  let resolve!: (valor: T) => void;
  let reject!: (erro: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const enderecoFixture: Endereco = {
  rua: 'Av. Paulista',
  numero: '1000',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01310-100',
};

const payloadFixture: UpdateUserProfilePayload = {
  nome: 'Ana Maria',
  sobrenome: 'Silva',
  email: 'ana.nova@email.com',
  documento: '12345678900',
  telefone: '11988887777',
  tipoPessoa: 'CPF',
};

const fotoFixture: ProfilePhotoAsset = {
  uri: 'file:///foto.jpg',
  contentType: 'image/jpeg',
  size: 2048,
};

const googleFixture: GoogleAuthPayload = {
  idToken: 'google-id-token',
  googleId: 'google-sub',
  email: 'ana@email.com',
  nome: 'Ana',
  sobrenome: 'Silva',
};

const desmontagens: Array<() => void> = [];

async function montar() {
  const { result, unmount } = renderWithProvider(AuthProvider, useAuth);
  desmontagens.push(unmount);
  await flushAsync();
  await flushAsync();
  return result;
}

beforeEach(() => {
  mockTokenStore = null;
  mockCachedUser = null;

  tokenMock.getToken.mockImplementation(async () => mockTokenStore);
  tokenMock.saveToken.mockImplementation(async (accessToken: string, expiresIn: number) => {
    mockTokenStore = { accessToken, expiresAt: Date.now() + expiresIn * 1000 };
  });
  tokenMock.clearToken.mockImplementation(async () => {
    mockTokenStore = null;
  });

  storageMock.obterUsuario.mockImplementation(async () => mockCachedUser);
  storageMock.salvarUsuario.mockImplementation(async () => undefined);
  storageMock.limparUsuario.mockImplementation(async () => undefined);

  pushMock.removerPushTokenAtual.mockImplementation(async () => undefined);

  apiMock.login.mockReset();
  apiMock.loginWithGoogle.mockReset();
  apiMock.getUserProfile.mockReset();
  apiMock.updateUserProfile.mockReset();
  apiMock.updateUserAddress.mockReset();
  apiMock.uploadUserProfilePhoto.mockReset();
  apiMock.removeUserProfilePhoto.mockReset();
});

afterEach(() => {
  while (desmontagens.length > 0) {
    const unmount = desmontagens.pop();
    unmount?.();
  }
});

describe('AuthProvider - restoreSession na montagem', () => {
  it('sem token: finaliza o carregamento, mantém user null e esquece a sessão', async () => {
    const result = await montar();

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(storageMock.obterUsuario).not.toHaveBeenCalled();
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(storageMock.limparUsuario).toHaveBeenCalled();
  });

  it('com token válido: aplica o cache antes de buscar o perfil remoto', async () => {
    const cacheado = criarPerfil({ nome: 'Cache' });
    const remoto = criarPerfil({ nome: 'Remoto' });
    const perfilPendente = adiar<UserProfile>();

    mockTokenStore = tokenValido();
    mockCachedUser = cacheado;
    apiMock.getUserProfile.mockReturnValue(perfilPendente.promise);

    const result = await montar();

    expect(result.current.user).toEqual(cacheado);
    expect(result.current.loading).toBe(false);
    expect(apiMock.getUserProfile).toHaveBeenCalledWith('token-valido');
    expect(storageMock.obterUsuario).toHaveBeenCalled();

    perfilPendente.resolve(remoto);
    await flushAsync();

    expect(result.current.user).toEqual(remoto);
    expect(storageMock.salvarUsuario).toHaveBeenCalledWith(remoto);
    expect(tokenMock.clearToken).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('com token expirado: limpa a sessão sem consultar o perfil', async () => {
    mockTokenStore = tokenExpirado();

    const result = await montar();

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(apiMock.getUserProfile).not.toHaveBeenCalled();
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(storageMock.limparUsuario).toHaveBeenCalled();
  });

  it('perfil rejeita com 401: esquece a sessão', async () => {
    mockTokenStore = tokenValido();
    mockCachedUser = criarPerfil();
    apiMock.getUserProfile.mockRejectedValue(new ApiRequestError('Não autorizado', 401));

    const result = await montar();

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(storageMock.limparUsuario).toHaveBeenCalled();
  });

  it('perfil rejeita com 403: esquece a sessão', async () => {
    mockTokenStore = tokenValido();
    mockCachedUser = criarPerfil();
    apiMock.getUserProfile.mockRejectedValue(new ApiRequestError('Proibido', 403));

    const result = await montar();

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(storageMock.limparUsuario).toHaveBeenCalled();
  });

  it.each([
    ['erro comum', () => new Error('rede indisponível')],
    ['ApiRequestError 500', () => new ApiRequestError('Erro interno', 500)],
  ])('perfil rejeita com %s: preserva a sessão em cache', async (_nome, criarErro) => {
    const cacheado = criarPerfil();
    mockTokenStore = tokenValido();
    mockCachedUser = cacheado;
    apiMock.getUserProfile.mockRejectedValue(criarErro());

    const result = await montar();

    expect(result.current.user).toEqual(cacheado);
    expect(result.current.loading).toBe(false);
    expect(tokenMock.clearToken).not.toHaveBeenCalled();
  });

  it('falha ao ler o cache: engole o erro e não apaga o token', async () => {
    mockTokenStore = tokenValido();
    storageMock.obterUsuario.mockRejectedValue(new Error('storage quebrado'));

    const result = await montar();

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(tokenMock.clearToken).not.toHaveBeenCalled();
    expect(apiMock.getUserProfile).not.toHaveBeenCalled();
  });

  it('sem cache: user fica null até o perfil remoto resolver', async () => {
    const remoto = criarPerfil();
    const perfilPendente = adiar<UserProfile>();

    mockTokenStore = tokenValido();
    mockCachedUser = null;
    apiMock.getUserProfile.mockReturnValue(perfilPendente.promise);

    const result = await montar();

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(storageMock.obterUsuario).toHaveBeenCalled();

    perfilPendente.resolve(remoto);
    await flushAsync();

    expect(result.current.user).toEqual(remoto);
    expect(result.current.loading).toBe(false);
  });
});

describe('AuthProvider - login', () => {
  it('sucesso: salva o token, cacheia o perfil e define o usuário', async () => {
    const perfil = criarPerfil();
    apiMock.login.mockResolvedValue({ accessToken: 'novo-token', expiresIn: 3600 });
    apiMock.getUserProfile.mockResolvedValue(perfil);

    const result = await montar();

    await act(async () => {
      await result.current.login('ana@email.com', 'senha123');
    });
    await flushAsync();

    expect(apiMock.login).toHaveBeenCalledWith({ email: 'ana@email.com', senha: 'senha123' });
    expect(apiMock.getUserProfile).toHaveBeenCalledWith('novo-token');
    expect(tokenMock.saveToken).toHaveBeenCalledWith('novo-token', 3600);
    expect(storageMock.salvarUsuario).toHaveBeenCalledWith(perfil);
    expect(result.current.user).toEqual(perfil);
    expect(result.current.loading).toBe(false);
  });

  it('falha: propaga o erro, limpa a sessão e finaliza o carregamento', async () => {
    apiMock.login.mockRejectedValue(new Error('Credenciais inválidas'));

    const result = await montar();

    await act(async () => {
      await expect(result.current.login('ana@email.com', 'errada')).rejects.toThrow(
        'Credenciais inválidas'
      );
    });
    await flushAsync();

    expect(apiMock.getUserProfile).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('loginWithGoogle: autentica com o payload e define o usuário', async () => {
    const perfil = criarPerfil();
    apiMock.loginWithGoogle.mockResolvedValue({ accessToken: 'google-token', expiresIn: 7200 });
    apiMock.getUserProfile.mockResolvedValue(perfil);

    const result = await montar();

    await act(async () => {
      await result.current.loginWithGoogle(googleFixture);
    });
    await flushAsync();

    expect(apiMock.loginWithGoogle).toHaveBeenCalledWith(googleFixture);
    expect(apiMock.login).not.toHaveBeenCalled();
    expect(apiMock.getUserProfile).toHaveBeenCalledWith('google-token');
    expect(tokenMock.saveToken).toHaveBeenCalledWith('google-token', 7200);
    expect(storageMock.salvarUsuario).toHaveBeenCalledWith(perfil);
    expect(result.current.user).toEqual(perfil);
    expect(result.current.loading).toBe(false);
  });
});

describe('AuthProvider - atualizações de perfil', () => {
  const operacoesSemToken: Array<[string, (auth: AuthValue) => Promise<unknown>]> = [
    ['updateProfile', (auth) => auth.updateProfile(payloadFixture)],
    ['updatePhone', (auth) => auth.updatePhone('11988887777')],
    ['updateAddress', (auth) => auth.updateAddress(enderecoFixture)],
    ['updatePhoto', (auth) => auth.updatePhoto(fotoFixture)],
    ['removePhoto', (auth) => auth.removePhoto()],
  ];

  it.each(operacoesSemToken)(
    '%s rejeita com "Sessão expirada" quando não há token',
    async (_nome, executar) => {
      const result = await montar();

      await expect(executar(result.current)).rejects.toThrow('Sessão expirada. Entre novamente.');
      expect(result.current.user).toBeNull();
    }
  );

  it('updateProfile: aplica o retorno no estado com o token vigente', async () => {
    const atualizado = criarPerfil({ nome: 'Ana Maria' });
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());
    apiMock.updateUserProfile.mockResolvedValue(atualizado);

    const result = await montar();
    await act(async () => {
      await result.current.updateProfile(payloadFixture);
    });

    expect(apiMock.updateUserProfile).toHaveBeenCalledWith('token-valido', payloadFixture);
    expect(storageMock.salvarUsuario).toHaveBeenCalledWith(atualizado);
    expect(result.current.user).toEqual(atualizado);
  });

  it('updatePhone: envia apenas o telefone com o token vigente', async () => {
    const atualizado = criarPerfil({ telefone: '11977776666' });
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());
    apiMock.updateUserProfile.mockResolvedValue(atualizado);

    const result = await montar();
    await act(async () => {
      await result.current.updatePhone('11977776666');
    });

    expect(apiMock.updateUserProfile).toHaveBeenCalledWith('token-valido', {
      telefone: '11977776666',
    });
    expect(result.current.user).toEqual(atualizado);
  });

  it('updateAddress: envia o endereço com o token vigente', async () => {
    const atualizado = criarPerfil({ endereco: enderecoFixture });
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());
    apiMock.updateUserAddress.mockResolvedValue(atualizado);

    const result = await montar();
    await act(async () => {
      await result.current.updateAddress(enderecoFixture);
    });

    expect(apiMock.updateUserAddress).toHaveBeenCalledWith('token-valido', enderecoFixture);
    expect(result.current.user).toEqual(atualizado);
  });

  it('updatePhoto: envia o arquivo com o token vigente', async () => {
    const atualizado = criarPerfil({ fotoPerfilUrl: 'https://cdn/foto.jpg' });
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());
    apiMock.uploadUserProfilePhoto.mockResolvedValue(atualizado);

    const result = await montar();
    await act(async () => {
      await result.current.updatePhoto(fotoFixture);
    });

    expect(apiMock.uploadUserProfilePhoto).toHaveBeenCalledWith('token-valido', fotoFixture);
    expect(result.current.user).toEqual(atualizado);
  });

  it('removePhoto: remove a foto com o token vigente', async () => {
    const atualizado = criarPerfil({ fotoPerfilUrl: null });
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());
    apiMock.removeUserProfilePhoto.mockResolvedValue(atualizado);

    const result = await montar();
    await act(async () => {
      await result.current.removePhoto();
    });

    expect(apiMock.removeUserProfilePhoto).toHaveBeenCalledWith('token-valido');
    expect(result.current.user).toEqual(atualizado);
  });

  it('updateProfile rejeita com "Sessão expirada" quando o token expirou', async () => {
    mockTokenStore = tokenExpirado();

    const result = await montar();

    await expect(result.current.updateProfile(payloadFixture)).rejects.toThrow(
      'Sessão expirada. Entre novamente.'
    );
    expect(apiMock.updateUserProfile).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});

describe('AuthProvider - logout', () => {
  it('remove o push token, limpa a sessão e finaliza o carregamento', async () => {
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());

    const result = await montar();

    await act(async () => {
      await result.current.logout();
    });

    expect(pushMock.removerPushTokenAtual).toHaveBeenCalledWith('token-valido');
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(storageMock.limparUsuario).toHaveBeenCalled();
  });

  it('não propaga falha ao remover o push token', async () => {
    mockTokenStore = tokenValido();
    apiMock.getUserProfile.mockResolvedValue(criarPerfil());
    pushMock.removerPushTokenAtual.mockRejectedValue(new Error('rede indisponível'));

    const result = await montar();

    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    expect(pushMock.removerPushTokenAtual).toHaveBeenCalledWith('token-valido');
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(storageMock.limparUsuario).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sem token: não tenta remover o push token', async () => {
    const result = await montar();

    await act(async () => {
      await result.current.logout();
    });

    expect(pushMock.removerPushTokenAtual).not.toHaveBeenCalled();
    expect(tokenMock.clearToken).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

describe('useAuth', () => {
  it('lança erro quando usado fora do AuthProvider', () => {
    expect(() => renderHook(useAuth)).toThrow(
      'useAuth deve ser usado dentro de um AuthProvider.'
    );
  });
});
