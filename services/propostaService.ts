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
      const erroTexto = await response.text();
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
