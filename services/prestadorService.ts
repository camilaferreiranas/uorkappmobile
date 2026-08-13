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

export interface LocalizacaoPrestador {
  latitude: number;
  longitude: number;
  atualizadaEm: string;
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

async function buscarPrestadores(url: string): Promise<Prestador[]> {
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

  return json?.data?.content ?? [];
}

export async function buscarPrestadoresProximos(): Promise<Prestador[]> {
  const localizacao = await obterLocalizacaoAtual();

  const params = new URLSearchParams({
    page: "0",
    size: "10",
  });

  if (localizacao) {
    params.set("latitude", String(localizacao.latitude));
    params.set("longitude", String(localizacao.longitude));
  }

  return buscarPrestadores(
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
