
const BASE_URL = 'http://192.168.15.27:8080/usuario';

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

export async function createUser(payload: CreateUserPayload): Promise<Usuario> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<Usuario> = await response.json();

  if (!response.ok) {
    throw new Error(json?.message ?? "Erro ao criar conta. Tente novamente.");
  }

  return json.data;
}