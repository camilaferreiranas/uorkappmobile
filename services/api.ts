const BASE_URL = '';

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

export interface EnderecoDTO {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface UserProfile {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  tipoPessoa: string;
  documento: string;
  endereco: EnderecoDTO | null;
}

export interface UpdateUserProfilePayload {
  email: string;
  senha?: string | null;
  endereco?: EnderecoDTO | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  const response = await fetch(`${BASE_URL}/usuario`, {
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

export async function getUserProfile(accessToken: string, email: string): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/usuario/perfil?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Não foi possível carregar os dados do usuário.');
  }

  const body: ApiResponse<UserProfile> = await response.json();
  return body.data;
}

export async function updateUserProfile(
  accessToken: string,
  email: string,
  payload: UpdateUserProfilePayload
): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/usuario/perfil?email=${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Não foi possível atualizar o perfil.');
  }

  const body: ApiResponse<UserProfile> = await response.json();
  return body.data;
}
