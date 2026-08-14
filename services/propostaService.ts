import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

export interface NovaProposta {
  prestadorId: number;
  titulo: string;
  descricao: string;
  valor: number;
}

export async function enviarProposta(proposta: NovaProposta): Promise<void> {
  try {
    const url = `${API_URL}/propostas`;
    const storedToken = await getToken();

    if (!storedToken || storedToken.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken.accessToken}`,
      },
      body: JSON.stringify(proposta),
    });


    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message ?? "Falha ao enviar proposta");
    }
  } catch (error) {
    console.error("Erro ao enviar proposta:", error);
    throw error;
  }
}

export interface DetalheDemanda {
  propostaId: number;
  titulo: string;
  nomeCliente: string;
  orcamento: number;
  distancia: number | null;
  descricao: string;
  nomePrestador: string;
}

export async function buscarDetalheDemanda(propostaId: number): Promise<DetalheDemanda> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/${propostaId}/detalhe-demanda`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível carregar a proposta."
    );
  }

  return json.data;
}
