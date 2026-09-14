import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

export type UrgenciaDemanda = "NORMAL" | "URGENTE" | "HOJE";

export interface FotoDemandaAsset {
  uri: string;
  nome: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  tamanhoBytes?: number;
}

export interface CriarDemandaPayload {
  categoriaId: number;
  titulo: string;
  descricao: string;
  localizacao: string;
  latitude?: number;
  longitude?: number;
  urgencia: UrgenciaDemanda;
  orcamento?: number;
  fotos?: FotoDemandaAsset[];
}

export interface DemandaPublicada {
  id: number;
  clienteId: number;
  categoriaId: number;
  categoria: string;
  titulo: string;
  descricao: string;
  localizacao: string;
  latitude: number | null;
  longitude: number | null;
  urgencia: UrgenciaDemanda;
  orcamento: number | null;
  status: "ABERTA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
  criadoEm: string;
  fotos: {
    id: number;
    url: string;
    contentType: string;
    tamanhoBytes: number;
    ordem: number;
    criadoEm: string;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiError {
  message?: string;
  erros?: string[];
}

export async function publicarDemanda(
  payload: CriarDemandaPayload
): Promise<DemandaPublicada> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const form = new FormData();
  form.append("categoriaId", String(payload.categoriaId));
  form.append("titulo", payload.titulo);
  form.append("descricao", payload.descricao);
  form.append("localizacao", payload.localizacao);
  form.append("urgencia", payload.urgencia);

  if (payload.latitude != null) {
    form.append("latitude", String(payload.latitude));
  }
  if (payload.longitude != null) {
    form.append("longitude", String(payload.longitude));
  }
  if (payload.orcamento != null) {
    form.append("orcamento", String(payload.orcamento));
  }

  payload.fotos?.forEach((foto) => {
    form.append(
      "fotos",
      {
        uri: foto.uri,
        name: foto.nome,
        type: foto.contentType,
      } as unknown as Blob
    );
  });

  const response = await fetch(`${API_URL}/demandas`, {
    method: "POST",
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
    body: form,
  });
  const json = (await response.json().catch(() => null)) as
    | ApiResponse<DemandaPublicada>
    | ApiError
    | null;

  if (!response.ok || !json || !("data" in json)) {
    throw new Error(
      (json && "erros" in json ? json.erros?.[0] : undefined) ??
        json?.message ??
        "Não foi possível publicar a demanda."
    );
  }

  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Não foi possível publicar a demanda.");
  }

  return json.data;
}

export async function buscarMinhasDemandas(): Promise<DemandaPublicada[]> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/demandas/minhas`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
  });
  const json = (await response.json().catch(() => null)) as
    | ApiResponse<DemandaPublicada[]>
    | ApiError
    | null;

  if (!response.ok || !json || !("data" in json)) {
    throw new Error(
      (json && "erros" in json ? json.erros?.[0] : undefined) ??
        json?.message ??
        "Não foi possível carregar suas demandas."
    );
  }

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.message ?? "Não foi possível carregar suas demandas.");
  }

  return json.data;
}
