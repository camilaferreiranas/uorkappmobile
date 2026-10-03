import { act } from 'react-test-renderer';
import { GOOGLE_CLIENT_IDS } from '../constants/env';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import type { GoogleAuthPayload } from '../services/api';
import { renderHook } from './helpers/render-hook';

let mockLoginWithGoogle: jest.Mock;
let mockAppOwnership: string | null = null;
let onSuccess: jest.Mock;

jest.mock('../contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({ loginWithGoogle: mockLoginWithGoogle })),
}));

jest.mock('expo-constants', () => ({
  get appOwnership(): string | null {
    return mockAppOwnership;
  },
}));

jest.mock('../constants/env', () => ({
  GOOGLE_CLIENT_IDS: { web: 'web-id', ios: 'ios-id' },
}));

type GoogleSigninMock = {
  configure: jest.Mock;
  hasPlayServices: jest.Mock;
  signIn: jest.Mock;
};

const { GoogleSignin } = jest.requireMock('@react-native-google-signin/google-signin') as {
  GoogleSignin: GoogleSigninMock;
};

const payload: GoogleAuthPayload = {
  idToken: 'id-token',
  googleId: 'google-id',
  email: 'ana@email.com',
  nome: 'Ana',
  sobrenome: 'Silva',
  avatarUrl: 'https://example.com/foto.jpg',
};

async function executarPrompt(promptAsync: () => Promise<void>): Promise<void> {
  await act(async () => {
    await promptAsync();
  });
}

beforeEach(() => {
  mockLoginWithGoogle = jest.fn(async () => undefined);
  mockAppOwnership = null;
  onSuccess = jest.fn();
  GOOGLE_CLIENT_IDS.web = 'web-id';
  GOOGLE_CLIENT_IDS.ios = 'ios-id';
  GoogleSignin.configure.mockReset();
  GoogleSignin.hasPlayServices.mockReset().mockResolvedValue(true);
  GoogleSignin.signIn.mockReset().mockResolvedValue({ type: 'success', data: undefined });
});

describe('useGoogleLogin', () => {
  it('faz login com sucesso quando authorize retorna credenciais', async () => {
    const authorize = jest.fn(async () => payload);
    const { result } = renderHook(() => useGoogleLogin(authorize, onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(authorize).toHaveBeenCalledTimes(1);
    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    expect(mockLoginWithGoogle).toHaveBeenCalledWith(payload);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('não chama loginWithGoogle nem onSuccess quando authorize retorna null', async () => {
    const authorize = jest.fn(async () => null);
    const { result } = renderHook(() => useGoogleLogin(authorize, onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('registra a mensagem quando authorize lança um Error', async () => {
    const authorize = jest.fn().mockRejectedValue(new Error('X'));
    const { result } = renderHook(() => useGoogleLogin(authorize, onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe('X');
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('registra mensagem padrão quando authorize lança valor que não é Error', async () => {
    const authorize = jest.fn().mockRejectedValue('valor inesperado');
    const { result } = renderHook(() => useGoogleLogin(authorize, onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe('Erro ao autenticar com Google. Tente novamente.');
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('propaga o erro quando loginWithGoogle rejeita', async () => {
    const authorize = jest.fn(async () => payload);
    mockLoginWithGoogle.mockRejectedValueOnce(new Error('Falha ao salvar a sessão.'));
    const { result } = renderHook(() => useGoogleLogin(authorize, onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe('Falha ao salvar a sessão.');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('ignora chamadas concorrentes enquanto authorize está pendente', async () => {
    let resolver!: (value: GoogleAuthPayload | null) => void;
    const authorize = jest.fn(
      () =>
        new Promise<GoogleAuthPayload | null>((resolve) => {
          resolver = resolve;
        })
    );
    const { result } = renderHook(() => useGoogleLogin(authorize, onSuccess));

    let primeira!: Promise<void>;
    act(() => {
      primeira = result.current.promptAsync();
    });
    expect(result.current.loading).toBe(true);

    await executarPrompt(result.current.promptAsync);
    expect(authorize).toHaveBeenCalledTimes(1);
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();

    await act(async () => {
      resolver(payload);
      await primeira;
    });

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    expect(mockLoginWithGoogle).toHaveBeenCalledWith(payload);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });
});

describe('useGoogleAuth', () => {
  it('bloqueia o login no Expo Go', async () => {
    mockAppOwnership = 'expo';
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe(
      'O login com Google exige uma build própria do app. Não está disponível no Expo Go.'
    );
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(GoogleSignin.configure).not.toHaveBeenCalled();
  });

  it('solicita credenciais quando o client ID da plataforma está ausente', async () => {
    GOOGLE_CLIENT_IDS.ios = '';
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe('Configure as credenciais do Google para esta plataforma.');
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(GoogleSignin.configure).not.toHaveBeenCalled();
  });

  it('conclui o login quando o signIn retorna sucesso com token', async () => {
    GoogleSignin.signIn.mockResolvedValue({
      type: 'success',
      data: {
        idToken: 'token-do-google',
        user: {
          id: 'usuario-1',
          email: 'ana@email.com',
          givenName: 'Ana',
          familyName: 'Silva',
          photo: 'https://example.com/foto.jpg',
        },
      },
    });
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(GoogleSignin.configure).toHaveBeenCalledWith({
      webClientId: 'web-id',
      iosClientId: 'ios-id',
    });
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalledWith({
      showPlayServicesUpdateDialog: true,
    });
    expect(mockLoginWithGoogle).toHaveBeenCalledWith({
      idToken: 'token-do-google',
      googleId: 'usuario-1',
      email: 'ana@email.com',
      nome: 'Ana',
      sobrenome: 'Silva',
      avatarUrl: 'https://example.com/foto.jpg',
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('não chama loginWithGoogle quando o signIn não retorna sucesso', async () => {
    GoogleSignin.signIn.mockResolvedValue({ type: 'cancelled' });
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('sinaliza ausência de idToken no retorno do Google', async () => {
    GoogleSignin.signIn.mockResolvedValue({
      type: 'success',
      data: {
        user: {
          id: 'usuario-1',
          email: 'ana@email.com',
          givenName: 'Ana',
          familyName: 'Silva',
          photo: 'https://example.com/foto.jpg',
        },
      },
    });
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe(
      'O Google não retornou um token de identidade. Verifique o client ID Web.'
    );
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('ignora silenciosamente quando o usuário cancela o login', async () => {
    GoogleSignin.signIn.mockRejectedValue({ code: 12501 });
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe('');
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('avisa quando o Google Play Services não está disponível', async () => {
    GoogleSignin.signIn.mockRejectedValue({ code: 12503 });
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe(
      'Atualize ou ative o Google Play Services para continuar.'
    );
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('propaga a mensagem quando o signIn rejeita com um erro comum', async () => {
    GoogleSignin.signIn.mockRejectedValue(new Error('Falha inesperada.'));
    const { result } = renderHook(() => useGoogleAuth(onSuccess));

    await executarPrompt(result.current.promptAsync);

    expect(result.current.error).toBe('Falha inesperada.');
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});
