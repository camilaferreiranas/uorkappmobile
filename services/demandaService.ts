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

export interface DemandaDisponivel extends DemandaPublicada {
  nomeCliente: string;
  candidaturaId: number | null;
  statusCandidatura: StatusCandidatura | null;
  mediaAvaliacoesCliente: number | null;
  totalAvaliacoesCliente: number | null;
}

export type OrdenacaoDemanda = "RECENTES" | "MAIOR_ORCAMENTO" | "MENOR_ORCAMENTO";

export type StatusCandidatura =
  | "PENDENTE"
  | "ACEITA"
  | "RECUSADA"
  | "CANCELADA"
  | "FINALIZADA";

export interface CandidaturaDemanda {
  id: number;
  demandaId: number;
  prestadorId: number;
  nomePrestador: string;
  mensagem: string;
  valor: number;
  status: StatusCandidatura;
  mediaAvaliacoes: number;
  totalAvaliacoes: number;
  criadaEm: string;
}

export interface CandidaturasDaDemanda {
  demandaId: number;
  titulo: string;
  status: DemandaPublicada["status"];
  candidaturas: CandidaturaDemanda[];
}

export interface PaginaDemandasDisponiveis {
  content: DemandaDisponivel[];
  number: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
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

async function consultarDemandaDisponivel<T>(
  caminho: string,
  signal?: AbortSignal
): Promise<T> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/demandas/disponiveis${caminho}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
  });
  const json = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | ApiError
    | null;

  if (!response.ok || !json || !("data" in json)) {
    throw new Error(
      (json && "erros" in json ? json.erros?.[0] : undefined) ??
        json?.message ??
        "Não foi possível carregar as demandas disponíveis."
    );
  }
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Não foi possível carregar as demandas disponíveis.");
  }
  return json.data;
}

export async function buscarDemandasDisponiveis(
  pagina = 0,
  tamanho = 20,
  signal?: AbortSignal,
  categoriaId?: number | null,
  ordenacao: OrdenacaoDemanda = "RECENTES"
): Promise<PaginaDemandasDisponiveis> {
  if (!Number.isInteger(pagina) || pagina < 0 || !Number.isInteger(tamanho) || tamanho < 1 || tamanho > 50) {
    throw new Error("Paginação inválida.");
  }
  if (categoriaId != null && (!Number.isSafeInteger(categoriaId) || categoriaId <= 0)) {
    throw new Error("Selecione uma categoria válida.");
  }
  const filtroCategoria = categoriaId == null ? "" : `&categoriaId=${categoriaId}`;
  const data = await consultarDemandaDisponivel<PaginaDemandasDisponiveis>(
    `?page=${pagina}&size=${tamanho}${filtroCategoria}&ordenacao=${ordenacao}`,
    signal
  );
  if (!Array.isArray(data.content) || !Number.isInteger(data.number) || typeof data.last !== "boolean") {
    throw new Error("Resposta inválida ao carregar as demandas disponíveis.");
  }
  return data;
}

export async function buscarDemandaDisponivel(
  id: number,
  signal?: AbortSignal
): Promise<DemandaDisponivel> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Demanda inválida.");
  }
  return consultarDemandaDisponivel<DemandaDisponivel>(`/${id}`, signal);
}

async function tokenValido() {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }
  return storedToken.accessToken;
}

async function lerResposta<T>(response: Response, mensagemPadrao: string): Promise<T> {
  const json = (await response.json().catch(() => null)) as ApiResponse<T> | ApiError | null;
  if (!response.ok || !json || !("data" in json) || !json.success || !json.data) {
    throw new Error(
      (json && "erros" in json ? json.erros?.[0] : undefined) ??
        json?.message ??
        mensagemPadrao
    );
  }
  return json.data;
}

export async function enviarCandidatura(
  demandaId: number,
  valor: number,
  mensagem: string
): Promise<CandidaturaDemanda> {
  if (!Number.isSafeInteger(demandaId) || demandaId <= 0) throw new Error("Demanda inválida.");
  if (!Number.isFinite(valor) || valor <= 0) throw new Error("Informe um valor válido para a proposta.");
  if (mensagem.trim().length > 500) throw new Error("A mensagem deve ter no máximo 500 caracteres.");
  const token = await tokenValido();
  const response = await fetch(`${API_URL}/demandas/${demandaId}/candidaturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ valor, mensagem: mensagem.trim() || null }),
  });
  return lerResposta(response, "Não foi possível enviar sua candidatura.");
}

export async function buscarCandidaturasDaDemanda(
  demandaId: number,
  signal?: AbortSignal
): Promise<CandidaturasDaDemanda> {
  if (!Number.isSafeInteger(demandaId) || demandaId <= 0) throw new Error("Demanda inválida.");
  const token = await tokenValido();
  const response = await fetch(`${API_URL}/demandas/${demandaId}/candidaturas`, {
    signal,
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await lerResposta<CandidaturasDaDemanda>(response, "Não foi possível carregar as candidaturas.");
  if (!Array.isArray(data.candidaturas)) throw new Error("Resposta inválida ao carregar as candidaturas.");
  return data;
}

export async function selecionarCandidatura(
  demandaId: number,
  candidaturaId: number
): Promise<CandidaturaDemanda> {
  if (!Number.isSafeInteger(demandaId) || demandaId <= 0 || !Number.isSafeInteger(candidaturaId) || candidaturaId <= 0) {
    throw new Error("Candidatura inválida.");
  }
  const token = await tokenValido();
  const response = await fetch(
    `${API_URL}/demandas/${demandaId}/candidaturas/${candidaturaId}/selecionar`,
    { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
  );
  return lerResposta(response, "Não foi possível selecionar este prestador.");
}
