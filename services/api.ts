import type { ImagePickerAsset } from 'expo-image-picker';

import { API_BASE_URL } from '@/constants/config';

/**
 * Cliente HTTP mínimo da API do appuork.
 *
 * O token JWT é mantido em memória pelo módulo e injetado em cada request.
 * A persistência do token / tela de login ficam fora do escopo desta feature
 * (portfólio) — `setAuthToken` é chamado pelo AuthContext.
 */

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  const text = await res.text();
  const body = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      body?.erros?.[0] ?? body?.message ?? `Erro ${res.status} ao chamar ${path}`;
    throw new ApiError(res.status, message);
  }

  return body as T;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Perfil do prestador
// ---------------------------------------------------------------------------

export type PortfolioFoto = {
  id: number;
  url: string;
  contentType: string;
  ordem: number;
  criadoEm: string;
};

export type PerfilPrestador = {
  id: number;
  nome: string;
  descricao: string;
  cidade: string;
  estado: string;
  dataCriacao: string;
  notaMedia: number;
  totalAvaliacoes: number;
  percentualConclusao: number;
  totalGanho: number;
  telefone: string;
  email: string;
  servicos: unknown[];
  portfolio: PortfolioFoto[];
};

export async function getProviderProfile(prestadorId: number): Promise<PerfilPrestador> {
  const res = await request<ApiResponse<PerfilPrestador>>(`/prestadores/${prestadorId}/perfil`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Portfólio
// ---------------------------------------------------------------------------

export async function getPortfolio(prestadorId: number): Promise<PortfolioFoto[]> {
  const res = await request<ApiResponse<PortfolioFoto[]>>(
    `/prestadores/${prestadorId}/portfolio`,
  );
  return res.data ?? [];
}

export async function uploadPortfolioPhoto(
  prestadorId: number,
  asset: ImagePickerAsset,
): Promise<PortfolioFoto> {
  const form = new FormData();
  const name = asset.fileName ?? `portfolio-${Date.now()}.jpg`;
  const type = asset.mimeType ?? 'image/jpeg';

  // React Native FormData aceita { uri, name, type } como parte de arquivo.
  form.append('file', {
    uri: asset.uri,
    name,
    type,
  } as unknown as Blob);

  const headers = new Headers();
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_BASE_URL}/prestadores/${prestadorId}/portfolio`, {
    method: 'POST',
    body: form,
    headers,
  });

  const text = await res.text();
  const body = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message = body?.erros?.[0] ?? body?.message ?? `Erro ${res.status} no upload`;
    throw new ApiError(res.status, message);
  }

  return (body as ApiResponse<PortfolioFoto>).data;
}

export async function deletePortfolioPhoto(
  prestadorId: number,
  fotoId: number,
): Promise<void> {
  await request<void>(`/prestadores/${prestadorId}/portfolio/${fotoId}`, {
    method: 'DELETE',
  });
}
