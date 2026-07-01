const BASE_URL = 'https://sua-api.exemplo.com'; // substitua pela URL real da sua API

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

export async function loginWithGoogle(payload: GoogleAuthPayload): Promise<void> {
  const response = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Erro ao autenticar com Google. Tente novamente.');
  }
}
