import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
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
import { clearToken, getToken, saveToken } from '../services/token-storage';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  updateProfile: (payload: UpdateUserProfilePayload) => Promise<UserProfile>;
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

      if (operation !== authOperation.current) {
        throw new Error("Autenticação cancelada.");
      }

      setUser(profile);
    } catch (error) {
      if (operation === authOperation.current) {
        setUser(null);
        await clearToken().catch(() => undefined);
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

  async function updatePhoto(photo: ProfilePhotoAsset) {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await uploadUserProfilePhoto(stored.accessToken, photo);
    setUser(profile);
    return profile;
  }

  async function removePhoto() {
    const stored = await getToken();
    if (!stored || stored.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const profile = await removeUserProfilePhoto(stored.accessToken);
    setUser(profile);
    return profile;
  }

  async function logout() {
    authOperation.current += 1;
    setUser(null);
    setLoading(false);
    await clearToken();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        updateProfile,
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
