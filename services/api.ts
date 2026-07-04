const BASE_URL = 'http://localhost:8080'; // TODO: ajustar isso

export interface CreateUserPayload {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  documento: string;
  tipoPessoa: 'PF' | 'PJ';
}

export interface GoogleAuthPayload {
  googleId: string;
  email: string;
  nome: string;
  sobrenome: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

export interface UserProfile {
  nome: string;
  sobrenome: string;
  email: string;
  documento: string;
  tipoPessoa: 'PF' | 'PJ';
  avatarUrl?: string;
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  const response = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Erro ao criar conta. Tente novamente.');
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'E-mail ou senha inválidos.');
  }

  return response.json();
}

export async function loginWithGoogle(payload: GoogleAuthPayload): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Erro ao autenticar com Google. Tente novamente.');
  }

  return response.json();
}

export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/usuarios/perfil`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Não foi possível carregar os dados do usuário.');
  }

  return response.json();
}
