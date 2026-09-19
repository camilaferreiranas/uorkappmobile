import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

export interface NovaProposta {
  prestadorId: number;
  tipoServico: string;
  descricao: string;
  localizacao: string;
  urgencia: "NORMAL" | "URGENTE" | "HOJE";
  foto?: {
    uri: string;
    nome: string;
    contentType: "image/jpeg" | "image/png" | "image/webp";
  };
}

export async function enviarProposta(proposta: NovaProposta): Promise<void> {
  try {
    const url = `${API_URL}/propostas`;
    const storedToken = await getToken();

    if (!storedToken || storedToken.expiresAt <= Date.now()) {
      throw new Error("Sessão expirada. Entre novamente.");
    }

    const form = new FormData();
    form.append("prestadorId", String(proposta.prestadorId));
    form.append("tipoServico", proposta.tipoServico);
    form.append("descricao", proposta.descricao);
    form.append("localizacao", proposta.localizacao);
    form.append("urgencia", proposta.urgencia);
    if (proposta.foto) {
      form.append("foto", {
        uri: proposta.foto.uri,
        name: proposta.foto.nome,
        type: proposta.foto.contentType,
      } as unknown as Blob);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storedToken.accessToken}`,
      },
      body: form,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok || !json?.success) {
      throw new Error(
        json?.erros?.[0] ??
          json?.message ??
          "Não foi possível enviar a proposta."
      );
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
  orcamento: number | null;
  localizacao: string | null;
  urgencia: "NORMAL" | "URGENTE" | "HOJE" | null;
  fotoUrl: string | null;
  distancia: number | null;
  descricao: string;
  nomePrestador: string;
  mediaAvaliacoesCliente: number;
  totalServicosFinalizados: number;
}

export interface PropostaResponse {
  id: number;
  nomeUsuario: string;
  nomePrestador: string;
  descricao: string;
  valor: number | null;
  valorCobrado: number | null;
  status: string;
  dataCriacao: string;
}

export type StatusProposta =
  | "PENDENTE"
  | "ACEITA"
  | "RECUSADA"
  | "CANCELADA"
  | "FINALIZADA";

export interface DemandaProfissional {
  propostaId: number;
  titulo: string;
  descricao: string;
  localizacao: string | null;
  urgencia: "NORMAL" | "URGENTE" | "HOJE" | null;
  fotoUrl: string | null;
  nomeCliente: string;
  valor: number | null;
  valorCobrado: number | null;
  status: StatusProposta;
  dataCriacao: string;
  notaCliente: number | null;
}

export interface ResumoPrestador {
  novasDemandas: number;
  emAndamento: number;
  concluido: number;
  faturamentoUltimos30Dias: number;
}

export interface HistoricoCliente {
  propostaId: number;
  prestadorId: number;
  titulo: string;
  descricao: string;
  localizacao: string | null;
  urgencia: "NORMAL" | "URGENTE" | "HOJE" | null;
  fotoUrl: string | null;
  nomePrestador: string;
  valor: number | null;
  valorCobrado: number | null;
  status: StatusProposta;
  dataCriacao: string;
  notaPrestador: number | null;
}

export interface AvaliacaoPrestadorPayload {
  nota: number;
  destaque: string | null;
  comentario: string | null;
}

export interface AvaliacaoPrestadorResponse extends AvaliacaoPrestadorPayload {
  propostaId: number;
}

export interface ContatoWhatsApp {
  nomePrestador: string;
  mensagem: string;
  whatsappUrl: string;
}

export async function buscarResumoPrestador(): Promise<ResumoPrestador> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/prestador/resumo`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível carregar os indicadores."
    );
  }

  const dados = json.data;
  if (!Number.isInteger(dados.novasDemandas)
    || !Number.isInteger(dados.emAndamento)
    || !Number.isFinite(dados.faturamentoUltimos30Dias)) {
    throw new Error("Os indicadores recebidos são inválidos. Tente novamente.");
  }

  return dados as ResumoPrestador;
}

export async function buscarDemandasDoPrestador(): Promise<DemandaProfissional[]> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/prestador/demandas`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível carregar as demandas."
    );
  }

  return Array.isArray(json.data) ? json.data : [];
}

export async function buscarHistoricoDoCliente(): Promise<HistoricoCliente[]> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/cliente/historico`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ??
        json?.message ??
        "Não foi possível carregar o histórico de serviços."
    );
  }

  return Array.isArray(json.data) ? json.data : [];
}

export async function buscarMinhasPropostas(): Promise<HistoricoCliente[]> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/cliente/minhas`, {
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ??
        json?.message ??
        "Não foi possível carregar suas propostas."
    );
  }

  return Array.isArray(json.data) ? json.data : [];
}

export async function buscarContatoWhatsApp(
  propostaId: number
): Promise<ContatoWhatsApp> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(
    `${API_URL}/propostas/${propostaId}/contato-whatsapp`,
    { headers: { Authorization: `Bearer ${storedToken.accessToken}` } }
  );
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ??
        json?.message ??
        "Não foi possível abrir a conversa com o prestador."
    );
  }

  return json.data;
}

export async function aceitarProposta(propostaId: number): Promise<PropostaResponse> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/${propostaId}/aceitar`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${storedToken.accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível aceitar a proposta."
    );
  }

  return json.data;
}

export async function finalizarProposta(propostaId: number, valorCobrado: number): Promise<PropostaResponse> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(`${API_URL}/propostas/${propostaId}/finalizar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedToken.accessToken}`,
    },
    body: JSON.stringify({ valorCobrado }),
  });
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível finalizar o serviço."
    );
  }

  return json.data;
}

export async function avaliarCliente(propostaId: number, nota: number): Promise<void> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(
    `${API_URL}/propostas/${propostaId}/avaliar-cliente`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken.accessToken}`,
      },
      body: JSON.stringify({ nota }),
    }
  );
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível avaliar o cliente."
    );
  }
}

export async function avaliarPrestador(
  propostaId: number,
  avaliacao: AvaliacaoPrestadorPayload
): Promise<AvaliacaoPrestadorResponse> {
  const storedToken = await getToken();
  if (!storedToken || storedToken.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  const response = await fetch(
    `${API_URL}/propostas/${propostaId}/avaliar-prestador`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken.accessToken}`,
      },
      body: JSON.stringify(avaliacao),
    }
  );
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.erros?.[0] ??
        json?.message ??
        "Não foi possível enviar a avaliação."
    );
  }

  return json.data;
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
