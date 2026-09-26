import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ApiRequestError,
  AuthResponse,
  Endereco,
  GoogleAuthPayload,
  ProfilePhotoAsset,
  UserProfile,
  UpdateUserProfilePayload,
  getUserProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  removeUserProfilePhoto,
  uploadUserProfilePhoto,
  updateUserProfile as updateUserProfileRequest,
  updateUserAddress as updateUserAddressRequest,
} from '../services/api';
import { limparUsuario, obterUsuario, salvarUsuario } from '../services/storageService';
import { clearToken, getToken, saveToken } from '../services/token-storage';
import { removerPushTokenAtual } from '../services/push-notification-service';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  updateProfile: (payload: UpdateUserProfilePayload) => Promise<UserProfile>;
  updatePhone: (telefone: string) => Promise<UserProfile>;
  updateAddress: (endereco: Endereco) => Promise<UserProfile>;
  updatePhoto: (photo: ProfilePhotoAsset) => Promise<UserProfile>;
  removePhoto: () => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const authOperation = useRef(0);

  useEffect(() => {
    restoreSession();
  }, []);

  function isCurrent(operation: number) {
    return operation === authOperation.current;
  }

  function sessionRejected(error: unknown) {
    return error instanceof ApiRequestError && (error.status === 401 || error.status === 403);
  }

  async function rememberUser(profile: UserProfile) {
    setUser(profile);
    await salvarUsuario(profile);
  }

  async function forgetSession() {
    setUser(null);
    await Promise.all([
      clearToken().catch(() => undefined),
      limparUsuario().catch(() => undefined),
    ]);
  }

  async function restoreSession() {
    const operation = authOperation.current;

    try {
      const stored = await getToken();
      if (!stored || stored.expiresAt <= Date.now()) {
        if (isCurrent(operation)) await forgetSession();
        return;
      }

      const cached = (await obterUsuario()) as UserProfile | null;
      if (cached && isCurrent(operation)) {
        setUser(cached);
        setLoading(false);
      }

      try {
        const profile = await getUserProfile(stored.accessToken);
        if (!isCurrent(operation)) return;
        await rememberUser(profile);
      } catch (error) {
        if (!isCurrent(operation) || !sessionRejected(error)) return;
        await forgetSession();
      }
    } catch {
      // Falha ao ler o armazenamento não deve apagar o token já salvo.
    } finally {
      if (isCurrent(operation)) setLoading(false);
    }
  }

  async function authenticate(request: () => Promise<AuthResponse>) {
    const operation = authOperation.current + 1;
    authOperation.current = operation;
    setLoading(true);
    setUser(null);

    try {
      // A conta anterior deixa de ser válida antes de iniciar uma nova autenticação.
      await clearToken();

      const auth = await request();
      const profile = await getUserProfile(auth.accessToken);

      if (operation !== authOperation.current) {
        throw new Error("Autenticação cancelada.");
      }

      await saveToken(auth.accessToken, auth.expiresIn);
      await salvarUsuario(profile);

      if (operation !== authOperation.current) {
        throw new Error("Autenticação cancelada.");
      }

      setUser(profile);
    } catch (error) {
      if (operation === authOperation.current) {
        await forgetSession();
      }
      throw error;
    } finally {
      if (operation === authOperation.current) setLoading(false);
    }
  }

  async function login(email: string, senha: string) {
    await authenticate(() => loginRequest({ email, senha }));
  }

  async function loginWithGoogle(payload: GoogleAuthPayload) {
    await authenticate(() => loginWithGoogleRequest(payload));
  }

  async function updateProfile(payload: UpdateUserProfilePayload) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await updateUserProfileRequest(stored.accessToken, payload);
    await rememberUser(profile);
    return profile;
  }

  async function updateAddress(endereco: Endereco) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await updateUserAddressRequest(stored.accessToken, endereco);
    await rememberUser(profile);
    return profile;
  }

  async function updatePhoto(photo: ProfilePhotoAsset) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await uploadUserProfilePhoto(stored.accessToken, photo);
    await rememberUser(profile);
    return profile;
  }

  async function removePhoto() {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await removeUserProfilePhoto(stored.accessToken);
    await rememberUser(profile);
    return profile;
  }

  async function logout() {
    authOperation.current += 1;
    setUser(null);
    setLoading(false);
    const stored = await getToken();
    try {
      if (stored && stored.expiresAt > Date.now()) {
        await removerPushTokenAtual(stored.accessToken);
      }
    } catch {
      // O logout local não deve ser bloqueado por indisponibilidade da rede.
    } finally {
      await Promise.all([
        clearToken().catch(() => undefined),
        limparUsuario().catch(() => undefined),
      ]);
    }
  }

  async function updatePhone(telefone: string) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await updateUserProfileRequest(stored.accessToken, { telefone });
    await rememberUser(profile);
    return profile;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        updateProfile,
        updatePhone,
        updateAddress,
        updatePhoto,
        removePhoto,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return context;
}
