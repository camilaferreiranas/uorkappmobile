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

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
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
  fotoPerfilUrl: string | null;
  totalServicosFinalizados: number;
  mediaAvaliacoesCliente: number;
}

export interface ProfilePhotoAsset {
  uri: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
}

interface ProfilePhotoUploadAuthorization {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
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

function readAuthResponse(json: AuthResponse & { data?: AuthResponse }): AuthResponse {
  const data = json?.data?.accessToken ? json.data : json;
  if (!data?.accessToken) {
    throw new Error("Resposta de login inválida.");
  }

  return {
    accessToken: data.accessToken,
    expiresIn: Number(data.expiresIn),
  };
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

  return readAuthResponse(await response.json());
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

  return readAuthResponse(await response.json());
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

  const json: ApiResponse<UserProfile> | ApiError = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiRequestError(
      ("erros" in json ? json.erros?.[0] : undefined) ??
      json.message ??
      "Não foi possível carregar os dados do usuário.",
      response.status
    );
  }

  return (json as ApiResponse<UserProfile>).data;
}

export async function updateUserProfile(
  accessToken: string,
  payload: UpdateUserProfilePayload | Pick<UpdateUserProfilePayload, "telefone">
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

export async function uploadUserProfilePhoto(
  accessToken: string,
  photo: ProfilePhotoAsset
): Promise<UserProfile> {
  const authorizationResponse = await fetch(
    `${API_URL}/usuario/perfil/foto/upload-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        contentType: photo.contentType,
        tamanhoBytes: photo.size,
      }),
    }
  );

  const authorizationJson =
    (await authorizationResponse.json()) as
      | ApiResponse<ProfilePhotoUploadAuthorization>
      | ApiError;

  if (!authorizationResponse.ok) {
    throw new Error(
      ("erros" in authorizationJson ? authorizationJson.erros?.[0] : undefined) ??
        authorizationJson.message ??
        "Não foi possível preparar o envio da foto."
    );
  }

  const authorization = (
    authorizationJson as ApiResponse<ProfilePhotoUploadAuthorization>
  ).data;
  const localResponse = await fetch(photo.uri);
  const imageBlob = await localResponse.blob();

  const uploadResponse = await fetch(authorization.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": photo.contentType },
    body: imageBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Não foi possível enviar a foto para o armazenamento.");
  }

  const confirmationResponse = await fetch(`${API_URL}/usuario/perfil/foto`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ objectKey: authorization.objectKey }),
  });
  const confirmationJson =
    (await confirmationResponse.json()) as ApiResponse<UserProfile> | ApiError;

  if (!confirmationResponse.ok) {
    throw new Error(
      ("erros" in confirmationJson ? confirmationJson.erros?.[0] : undefined) ??
        confirmationJson.message ??
        "A foto foi enviada, mas não foi possível atualizar o perfil."
    );
  }

  return (confirmationJson as ApiResponse<UserProfile>).data;
}

export async function removeUserProfilePhoto(
  accessToken: string
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/usuario/perfil/foto`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await response.json()) as ApiResponse<UserProfile> | ApiError;

  if (!response.ok) {
    throw new Error(
      ("erros" in json ? json.erros?.[0] : undefined) ??
        json.message ??
        "Não foi possível remover a foto de perfil."
    );
  }

  return (json as ApiResponse<UserProfile>).data;
}
