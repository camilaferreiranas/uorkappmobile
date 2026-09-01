import { API_URL } from "./api_url";


export interface CreateUserPayload {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  documento: string;
  tipoPessoa: 'CPF' | 'CNPJ';
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  erros?: string[];
  message?: string;
}

export async function createUser(payload: CreateUserPayload): Promise<Usuario> {
  const response = await fetch(API_URL + "/usuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as ApiResponse<Usuario> & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(
      json.erros?.[0] ?? json.message ?? "Erro ao criar conta. Tente novamente."
    );
  }

  return json.data;
}
