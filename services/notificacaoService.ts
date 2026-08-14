import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dataCriacao: string;
  propostaId: number;
}

export interface NotificacoesData {
  naoLidas: number;
  notificacoes: Notificacao[];
}

async function getAccessToken(): Promise<string> {
  const stored = await getToken();
  if (!stored || stored.expiresAt <= Date.now()) {
    throw new Error("Sessão expirada. Entre novamente.");
  }
  return stored.accessToken;
}

export async function buscarNotificacoes(): Promise<NotificacoesData> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_URL}/notificacoes`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível carregar as notificações."
    );
  }

  return json.data;
}

export async function marcarNotificacaoComoLida(id: number): Promise<Notificacao> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_URL}/notificacoes/${id}/lida`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.erros?.[0] ?? json?.message ?? "Não foi possível atualizar a notificação."
    );
  }

  return json.data;
}
