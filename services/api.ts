import { API_URL } from "./api_url";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  message?: string;
  erros?: string[];
}
export interface Endereco {
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}

export interface UserProfile {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  documento: string;
  tipoPessoa: "CPF" | "CNPJ";
  endereco: Endereco;
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


export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.erros?.[0] ??
      error?.message ??
      'E-mail ou senha inválidos.'
    );
  }

  return response.json();
}

export async function loginWithGoogle(payload: GoogleAuthPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/google`, {
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

export async function getUserProfile(
  accessToken: string
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/usuario/perfil`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json: ApiResponse<UserProfile> | ApiError = await response.json();

  if (!response.ok) {
    throw new Error(
      ("erros" in json ? json.erros?.[0] : undefined) ??
      json.message ??
      "Não foi possível carregar os dados do usuário."
    );
  }

  return (json as ApiResponse<UserProfile>).data;
}
