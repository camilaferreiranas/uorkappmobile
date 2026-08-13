import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AuthResponse,
  Endereco,
  GoogleAuthPayload,
  UserProfile,
  UpdateUserProfilePayload,
  getUserProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  updateUserProfile as updateUserProfileRequest,
  updateUserAddress as updateUserAddressRequest,
} from '../services/api';
import { clearToken, getToken, saveToken } from '../services/token-storage';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  updateProfile: (payload: UpdateUserProfilePayload) => Promise<UserProfile>;
  updateAddress: (endereco: Endereco) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(auth: AuthResponse): Promise<UserProfile> {
  const profile = await getUserProfile(auth.accessToken);

  // Persiste por último para que uma restauração antiga não apague
  // o token da sessão que acabou de ser autenticada.
  await saveToken(auth.accessToken, auth.expiresIn);
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const authOperation = useRef(0);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    const operation = authOperation.current;

    try {
      const stored = await getToken();
      if (stored && stored.expiresAt > Date.now()) {
        const profile = await getUserProfile(stored.accessToken);
        if (operation === authOperation.current) setUser(profile);
      } else if (stored && operation === authOperation.current) {
        await clearToken();
      }
    } catch {
      if (operation === authOperation.current) await clearToken();
    } finally {
      if (operation === authOperation.current) setLoading(false);
    }
  }

  async function login(email: string, senha: string) {
    const auth = await loginRequest({ email, senha });
    authOperation.current += 1;
    const profile = await loadProfile(auth);
    setUser(profile);
    setLoading(false);
  }

  async function loginWithGoogle(payload: GoogleAuthPayload) {
    const auth = await loginWithGoogleRequest(payload);
    authOperation.current += 1;
    const profile = await loadProfile(auth);
    setUser(profile);
    setLoading(false);
  }

  async function updateProfile(payload: UpdateUserProfilePayload) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await updateUserProfileRequest(stored.accessToken, payload);
    setUser(profile);
    return profile;
  }

  async function updateAddress(endereco: Endereco) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await updateUserAddressRequest(stored.accessToken, endereco);
    setUser(profile);
    return profile;
  }

  async function logout() {
    authOperation.current += 1;
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, updateProfile, updateAddress, logout }}
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
