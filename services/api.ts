import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

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
  telefone: string | null;
  tipoPessoa: "CPF" | "CNPJ";
  endereco: Endereco;
}

export interface UpdateUserProfilePayload {
  nome: string;
  sobrenome: string;
  email: string;
  senha?: string;
  documento: string;
  telefone: string;
  tipoPessoa: "CPF" | "CNPJ";
}

export interface CepResult {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
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

export async function updateUserProfile(
  accessToken: string,
  payload: UpdateUserProfilePayload
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/usuario/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<UserProfile> | ApiError = await response.json();

  if (!response.ok) {
    throw new Error(
      ("erros" in json ? json.erros?.[0] : undefined) ??
      json.message ??
      "Não foi possível atualizar o perfil."
    );
  }

  return (json as ApiResponse<UserProfile>).data;
}

export async function getAddressByCep(cep: string): Promise<CepResult> {
  const normalizedCep = cep.replace(/\D/g, "");
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/enderecos/cep/${normalizedCep}`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json: ApiResponse<CepResult> | ApiError = await response.json();

  if (!response.ok) {
    throw new Error(
      ("erros" in json ? json.erros?.[0] : undefined) ??
      json.message ??
      "Não foi possível consultar o CEP."
    );
  }

  return (json as ApiResponse<CepResult>).data;
}

export async function updateUserAddress(
  accessToken: string,
  endereco: Endereco
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/usuario/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ endereco }),
  });

  const json: ApiResponse<UserProfile> | ApiError = await response.json();

  if (!response.ok) {
    throw new Error(
      ("erros" in json ? json.erros?.[0] : undefined) ??
      json.message ??
      "Não foi possível salvar o endereço."
    );
  }

  return (json as ApiResponse<UserProfile>).data;
}
