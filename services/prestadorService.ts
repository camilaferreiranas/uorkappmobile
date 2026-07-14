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

    const response = await fetch(url);

    if (!response.ok) {
        const erroTexto = await response.text();
        throw new Error(`Erro na requisição: ${response.status}`);
    }

    const json = await response.json();


    return json.data.content;

    } catch (error) {
    console.error("Erro ao buscar prestadores:", error);
    throw error;
  }
}

// ---- Perfil do prestador ----

export interface ServicoPrestador {
  titulo: string;
  descricao: string;
  valorMedio: number;
  avaliacao: number;
}

export interface PerfilPrestador {
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
  telefone: string | null;
  email: string;
  servicos: ServicoPrestador[];
}

export async function buscarPerfilPrestador(prestadorId: number): Promise<PerfilPrestador> {
  try {
    const url = `${API_URL}/prestadores/prestadores/${prestadorId}/perfil`;

    const response = await fetch(url);


    if (!response.ok) {
      const erroTexto = await response.text();
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message ?? "Falha ao carregar perfil");
    }

    return json.data;

  } catch (error) {
    console.error("Erro ao buscar perfil do prestador:", error);
    throw error;
  }
}
