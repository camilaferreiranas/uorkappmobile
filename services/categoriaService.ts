import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

export interface Categoria {
  id: number;
  nome: string;
}

export async function buscarCategorias(): Promise<Categoria[]> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/categorias`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ??
        json?.message ??
        "Não foi possível carregar as categorias."
    );
  }

  return Array.isArray(json) ? json : [];
}
