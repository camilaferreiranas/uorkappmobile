import { API_URL } from "./api_url";

export interface Prestador {
  id: number;
  nome: string;
  categorias: string[];
  mediaAvaliacoes: number;
}

export async function buscarPrestadoresCategoria(categoriaId: number): Promise<Prestador[]> {
   try {
    const url =  `${API_URL}/prestadores?categoriaId=${categoriaId}&page=0&size=10`;

    console.log("URL CHAMADA:", url);

    const response = await fetch(url);

    console.log("STATUS:", response.status);

    if (!response.ok) {
        const erroTexto = await response.text();
        console.log("ERRO API:", erroTexto);
        throw new Error(`Erro na requisição: ${response.status}`);
    }

    const json = await response.json();

    console.log("RETORNO API:", JSON.stringify(json, null, 2));

    return json.data.content;

    } catch (error) {
    console.error("Erro ao buscar prestadores:", error);
    throw error;
  }
}
