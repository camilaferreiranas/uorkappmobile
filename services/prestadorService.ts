import { API_URL } from "./api_url";
import { obterLocalizacaoAtual } from "./locationService";
import { getToken } from "./token-storage";

export interface Prestador {
  id: number;
  nome: string;
  categorias: string[];
  mediaAvaliacoes: number;
  distanciaKm: number | null;
}

export interface PaginaPrestadores {
  content: Prestador[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface LocalizacaoPrestador {
  latitude: number;
  longitude: number;
  atualizadaEm: string;
}

export interface CadastroPrestadorPayload {
  descricao: string;
  categoriasIds: number[];
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export async function verificarCadastroPrestador(): Promise<boolean> {
  const storedToken = await getToken();

  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/prestadores/me/status`, {
    headers: {
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ??
      json?.message ??
      "Não foi possível verificar o cadastro profissional."
    );
  }

  return json.data === true;
}

export async function cadastrarPrestador(
  payload: CadastroPrestadorPayload
): Promise<void> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/prestadores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ??
        json?.message ??
        "Não foi possível concluir o cadastro profissional."
    );
  }
}

async function buscarPaginaPrestadores(url: string): Promise<PaginaPrestadores> {
  const storedToken = await getToken();

  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ??
      json?.message ??
      `Erro ao buscar prestadores: ${response.status}`
    );
  }

  const data = json?.data;
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    page: Number(data?.page ?? 0),
    size: Number(data?.size ?? 0),
    totalElements: Number(data?.totalElements ?? 0),
    totalPages: Number(data?.totalPages ?? 0),
    first: data?.first !== false,
    last: data?.last !== false,
  };
}

async function buscarPrestadores(url: string): Promise<Prestador[]> {
  return (await buscarPaginaPrestadores(url)).content;
}

export async function buscarPrestadoresProximos(): Promise<Prestador[]> {
  return (await buscarPaginaPrestadoresProximos()).content;
}

export async function buscarPaginaPrestadoresProximos(
  page = 0,
  size = 10
): Promise<PaginaPrestadores> {
  const localizacao = await obterLocalizacaoAtual();

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (localizacao) {
    params.set("latitude", String(localizacao.latitude));
    params.set("longitude", String(localizacao.longitude));
  }

  return buscarPaginaPrestadores(
    `${API_URL}/prestadores?${params.toString()}`
  );
}

export async function buscarPrestadoresCategoria(categoriaId: number): Promise<Prestador[]> {
  const localizacao = await obterLocalizacaoAtual();
  const params = new URLSearchParams({
    categoriaId: String(categoriaId),
    page: "0",
    size: "10",
  });

  if (localizacao) {
    params.set("latitude", String(localizacao.latitude));
    params.set("longitude", String(localizacao.longitude));
  }

  return buscarPrestadores(`${API_URL}/prestadores?${params.toString()}`);
}

export async function buscarPrestadoresPorTermo(
  busca: string,
  page = 0,
  size = 30
): Promise<PaginaPrestadores> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const termo = busca.trim();

  if (termo) {
    params.set("busca", termo);
  }

  return buscarPaginaPrestadores(
    `${API_URL}/prestadores?${params.toString()}`
  );
}

export async function atualizarLocalizacaoPrestador(): Promise<LocalizacaoPrestador> {
  const [localizacao, storedToken] = await Promise.all([
    obterLocalizacaoAtual(),
    getToken(),
  ]);

  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  if (!localizacao) {
    throw new Error(
      "Permita o acesso à localização para aparecer para clientes próximos."
    );
  }

  const response = await fetch(`${API_URL}/prestadores/localizacao`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
    body: JSON.stringify(localizacao),
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ??
      json?.message ??
      "Não foi possível atualizar a localização profissional."
    );
  }

  return json.data;
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
    const storedToken = await getToken();

    if (!storedToken || storedToken.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${storedToken.accessToken}`,
      },
    });


    if (!response.ok) {
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
