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

export interface PropostaResponse {
  id: number;
  nomeUsuario: string;
  nomePrestador: string;
  descricao: string;
  valor: number;
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
  nomeCliente: string;
  valor: number;
  status: StatusProposta;
  dataCriacao: string;
}

export interface HistoricoCliente {
  propostaId: number;
  prestadorId: number;
  titulo: string;
  descricao: string;
  nomePrestador: string;
  valor: number;
  status: StatusProposta;
  dataCriacao: string;
}

export interface ContatoWhatsApp {
  nomePrestador: string;
  mensagem: string;
  whatsappUrl: string;
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
