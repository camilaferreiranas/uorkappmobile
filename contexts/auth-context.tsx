import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  AuthResponse,
  GoogleAuthPayload,
  UserProfile,
  getUserProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
} from '../services/api';
import { clearToken, getToken, saveToken } from '../services/token-storage';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(auth: AuthResponse): Promise<UserProfile> {
  await saveToken(auth.accessToken, auth.expiresIn);
  return getUserProfile(auth.accessToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const stored = await getToken();
      if (stored && stored.expiresAt > Date.now()) {
        const profile = await getUserProfile(stored.accessToken);
        setUser(profile);
      } else if (stored) {
        await clearToken();
      }
    } catch {
      await clearToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, senha: string) {
    const auth = await loginRequest({ email, senha });
    const profile = await loadProfile(auth);
    setUser(profile);
  }

  async function loginWithGoogle(payload: GoogleAuthPayload) {
    const auth = await loginWithGoogleRequest(payload);
    const profile = await loadProfile(auth);
    setUser(profile);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
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
