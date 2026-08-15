import { Client, type IMessage } from "@stomp/stompjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { API_URL } from "../services/api_url";
import {
  buscarNotificacoes,
  buscarNotificacoesCliente,
  marcarNotificacaoComoLida,
  type Notificacao,
} from "../services/notificacaoService";
import { getToken } from "../services/token-storage";
import { useAuth } from "./auth-context";

type ContextoNotificacao = "cliente" | "prestador";

interface NotificationContextValue {
  notificacoesCliente: Notificacao[];
  notificacoesPrestador: Notificacao[];
  naoLidasCliente: number;
  naoLidasPrestador: number;
  conectado: boolean;
  sincronizarCliente: () => Promise<void>;
  sincronizarPrestador: () => Promise<void>;
  marcarComoLida: (
    contexto: ContextoNotificacao,
    notificacaoId: number
  ) => Promise<Notificacao>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function adicionarSemDuplicar(
  atuais: Notificacao[],
  recebida: Notificacao
): Notificacao[] {
  const existente = atuais.findIndex((item) => item.id === recebida.id);
  if (existente < 0) return [recebida, ...atuais];

  return atuais.map((item) => (item.id === recebida.id ? recebida : item));
}

interface NotificacaoRealtime {
  contexto: "CLIENTE" | "PRESTADOR";
  notificacao: Notificacao;
}

function lerMensagemRealtime(message: IMessage): NotificacaoRealtime | null {
  try {
    const recebida = JSON.parse(message.body) as NotificacaoRealtime;
    if (
      (recebida?.contexto === "CLIENTE" || recebida?.contexto === "PRESTADOR") &&
      typeof recebida.notificacao?.id === "number"
    ) {
      return recebida;
    }
    return null;
  } catch {
    return null;
  }
}

function lerNotificacao(message: IMessage): Notificacao | null {
  try {
    const recebida = JSON.parse(message.body) as Notificacao;
    return typeof recebida?.id === "number" ? recebida : null;
  } catch {
    return null;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notificacoesCliente, setNotificacoesCliente] = useState<Notificacao[]>([]);
  const [notificacoesPrestador, setNotificacoesPrestador] = useState<Notificacao[]>([]);
  const [conectado, setConectado] = useState(false);

  const sincronizarCliente = useCallback(async () => {
    const data = await buscarNotificacoesCliente();
    setNotificacoesCliente(data.notificacoes);
  }, []);

  const sincronizarPrestador = useCallback(async () => {
    const data = await buscarNotificacoes();
    setNotificacoesPrestador(data.notificacoes);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotificacoesCliente([]);
      setNotificacoesPrestador([]);
      setConectado(false);
      return;
    }

    let encerrado = false;
    let stompClient: Client | null = null;

    async function iniciar() {
      const storedToken = await getToken();
      if (encerrado || !storedToken || storedToken.expiresAt <= Date.now()) return;

      void Promise.allSettled([sincronizarCliente(), sincronizarPrestador()]);

      const wsUrl = `${API_URL.replace(/^http/, "ws")}/ws`;
      stompClient = new Client({
        webSocketFactory: () => new WebSocket(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${storedToken.accessToken}`,
        },
        reconnectDelay: 5000,
        connectionTimeout: 10000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        appendMissingNULLonIncoming: true,
        debug: () => undefined,
        onConnect: () => {
          if (encerrado || !stompClient) return;
          setConectado(true);

          const adicionarCliente = (notificacao: Notificacao) => {
            setNotificacoesCliente((atuais) =>
              adicionarSemDuplicar(atuais, notificacao)
            );
          };

          const adicionarPrestador = (notificacao: Notificacao) => {
            setNotificacoesPrestador((atuais) =>
              adicionarSemDuplicar(atuais, notificacao)
            );
          };

          stompClient.subscribe("/user/queue/notificacoes", (message) => {
            const recebida = lerMensagemRealtime(message);
            if (!recebida) return;

            if (recebida.contexto === "CLIENTE") {
              adicionarCliente(recebida.notificacao);
            } else {
              adicionarPrestador(recebida.notificacao);
            }
          });

          // Compatibilidade com instancias do backend que ainda publicam
          // nos destinos separados usados antes da fila unificada.
          stompClient.subscribe("/user/queue/notificacoes/cliente", (message) => {
            const recebida = lerNotificacao(message);
            if (recebida) adicionarCliente(recebida);
          });

          stompClient.subscribe("/user/queue/notificacoes/prestador", (message) => {
            const recebida = lerNotificacao(message);
            if (recebida) adicionarPrestador(recebida);
          });

          void Promise.allSettled([sincronizarCliente(), sincronizarPrestador()]);
        },
        onDisconnect: () => setConectado(false),
        onWebSocketClose: () => setConectado(false),
        onStompError: () => setConectado(false),
        onWebSocketError: () => setConectado(false),
      });

      stompClient.activate();
    }

    void iniciar();

    return () => {
      encerrado = true;
      setConectado(false);
      if (stompClient) void stompClient.deactivate();
    };
  }, [sincronizarCliente, sincronizarPrestador, user]);

  useEffect(() => {
    if (!user) return;

    const sincronizarAoRetornar = () => {
      void Promise.allSettled([sincronizarCliente(), sincronizarPrestador()]);
    };

    const appStateSubscription = AppState.addEventListener("change", (estado) => {
      if (estado === "active") sincronizarAoRetornar();
    });

    const aoAlterarVisibilidade = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        sincronizarAoRetornar();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", aoAlterarVisibilidade);
    }

    return () => {
      appStateSubscription.remove();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", aoAlterarVisibilidade);
      }
    };
  }, [sincronizarCliente, sincronizarPrestador, user]);

  const marcarComoLida = useCallback(
    async (contexto: ContextoNotificacao, notificacaoId: number) => {
      const atualizada = await marcarNotificacaoComoLida(notificacaoId);
      const atualizar = (atuais: Notificacao[]) =>
        atuais.map((item) => (item.id === atualizada.id ? atualizada : item));

      if (contexto === "cliente") {
        setNotificacoesCliente(atualizar);
      } else {
        setNotificacoesPrestador(atualizar);
      }

      return atualizada;
    },
    []
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notificacoesCliente,
      notificacoesPrestador,
      naoLidasCliente: notificacoesCliente.filter((item) => !item.lida).length,
      naoLidasPrestador: notificacoesPrestador.filter((item) => !item.lida).length,
      conectado,
      sincronizarCliente,
      sincronizarPrestador,
      marcarComoLida,
    }),
    [
      conectado,
      marcarComoLida,
      notificacoesCliente,
      notificacoesPrestador,
      sincronizarCliente,
      sincronizarPrestador,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications deve ser usado dentro de NotificationProvider.");
  }
  return context;
}
