import { API_URL } from "./api_url";

export interface NovaProposta {
  email: string;  
  prestadorId: number;
  titulo: string;
  descricao: string;
  valor: number;
}

export async function enviarProposta(proposta: NovaProposta): Promise<void> {
  try {
    const url = `${API_URL}/propostas`;


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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