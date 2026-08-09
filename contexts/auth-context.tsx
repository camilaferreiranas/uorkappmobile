import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  AuthResponse,
  GoogleAuthPayload,
  UpdateUserProfilePayload,
  UserProfile,
  getUserProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  updateUserProfile,
} from '../services/api';
import { clearToken, getToken, saveEmail, saveToken } from '../services/token-storage';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  updateProfile: (payload: UpdateUserProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(auth: AuthResponse, email: string): Promise<UserProfile | null> {
  await saveToken(auth.accessToken, auth.expiresIn, email);
  try {
    return await getUserProfile(auth.accessToken, email);
  } catch {
    return null;
  }
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
      if (stored) {
        if (stored.expiresAt <= Date.now()) {
          await clearToken();
        } else {
          try {
            const profile = await getUserProfile(stored.accessToken, stored.email);
            setUser(profile);
          } catch {
            setUser(null);
          }
        }
      }
    } catch {
      await clearToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, senha: string) {
    const auth = await loginRequest({ email, senha });
    const profile = await loadProfile(auth, email);
    setUser(profile);
  }

  async function loginWithGoogle(payload: GoogleAuthPayload) {
    const auth = await loginWithGoogleRequest(payload);
    const profile = await loadProfile(auth, payload.email);
    setUser(profile);
  }

  async function updateProfile(payload: UpdateUserProfilePayload) {
    const stored = await getToken();
    if (!stored) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const profile = await updateUserProfile(stored.accessToken, stored.email, payload);
    if (profile.email !== stored.email) {
      await saveEmail(profile.email);
    }
    setUser(profile);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, updateProfile, logout }}>
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
