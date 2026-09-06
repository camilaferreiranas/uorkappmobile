import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { setAuthToken } from '@/services/api';

/**
 * Contexto de autenticação leve.
 *
 * Guarda o token JWT e a identidade do usuário logado em memória. A tela de
 * login e a persistência segura do token (expo-secure-store) serão adicionadas
 * fora do escopo da feature de portfólio; por ora `signIn` pode ser chamado
 * manualmente após o login.
 */

export type AuthUser = {
  email: string;
  /** id do PrestadorServico, quando o usuário é prestador. */
  prestadorId?: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
  /** true quando o usuário logado é o dono daquele prestador. */
  isOwnerOf: (prestadorId: number) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback((newToken: string, newUser: AuthUser) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const isOwnerOf = useCallback(
    (prestadorId: number) => user?.prestadorId === prestadorId,
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: token != null,
      signIn,
      signOut,
      isOwnerOf,
    }),
    [user, token, signIn, signOut, isOwnerOf],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
