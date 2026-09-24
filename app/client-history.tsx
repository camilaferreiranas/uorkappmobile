import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  type LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileScreenHeader } from "../components/ui/profile-screen-header";
import { Colors } from "../constants/theme";
import {
  buscarContatoWhatsApp,
  buscarHistoricoDoCliente,
  confirmarConclusao,
  naoConfirmarConclusao,
  type HistoricoCliente,
  type StatusProposta,
} from "../services/propostaService";

type FiltroHistorico = "TODOS" | "ATIVOS" | "FINALIZADOS" | "ENCERRADOS";

const statusConfig: Record<
  StatusProposta,
  { label: string; color: string; background: string; icon: "schedule" | "handshake" | "cancel" | "block" | "check-circle" }
> = {
  PENDENTE: { label: "Aguardando", color: Colors.warning, background: "#FFF7EA", icon: "schedule" },
  ACEITA: { label: "Aceita", color: Colors.primary, background: Colors.primaryLight, icon: "handshake" },
  AGUARDANDO_CONFIRMACAO: { label: "Confirme a conclusão", color: Colors.warning, background: "#FFF7EA", icon: "schedule" },
  RECUSADA: { label: "Recusada", color: Colors.textSecondary, background: Colors.background, icon: "cancel" },
  CANCELADA: { label: "Cancelada", color: Colors.error, background: "#FDECEA", icon: "block" },
  FINALIZADA: { label: "Concluída", color: Colors.success, background: "#EAF7ED", icon: "check-circle" },
};

const filtros: { id: FiltroHistorico; label: string }[] = [
  { id: "TODOS", label: "Todos" },
  { id: "ATIVOS", label: "Ativas" },
  { id: "FINALIZADOS", label: "Concluídos" },
  { id: "ENCERRADOS", label: "Encerrados" },
];

function formatarValor(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string) {
  const date = new Date(data);
  if (Number.isNaN(date.getTime())) return "Data indisponível";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function urgenciaParaTela(urgencia: HistoricoCliente["urgencia"]) {
  if (urgencia === "URGENTE") return "Urgente";
  if (urgencia === "HOJE") return "Hoje";
  return "Normal";
}

function pertenceAoFiltro(status: StatusProposta, filtro: FiltroHistorico) {
  if (filtro === "TODOS") return true;
  if (filtro === "ATIVOS") return status === "PENDENTE" || status === "ACEITA" || status === "AGUARDANDO_CONFIRMACAO";
  if (filtro === "FINALIZADOS") return status === "FINALIZADA";
  return status === "RECUSADA" || status === "CANCELADA";
}

export default function ClientHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ propostaId?: string | string[] }>();
  const propostaIdParam = Array.isArray(params.propostaId)
    ? params.propostaId[0]
    : params.propostaId;
  const propostaIdDestacada = propostaIdParam && /^\d+$/.test(propostaIdParam)
    ? Number(propostaIdParam)
    : null;
  const scrollRef = useRef<ScrollView>(null);
  const navegouAtePropostaRef = useRef(false);
  const [historico, setHistorico] = useState<HistoricoCliente[]>([]);
  const [filtro, setFiltro] = useState<FiltroHistorico>("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [abrindoWhatsAppId, setAbrindoWhatsAppId] = useState<number | null>(null);
  const [respondendoConclusaoId, setRespondendoConclusaoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    navegouAtePropostaRef.current = false;
    if (propostaIdDestacada != null) setFiltro("TODOS");
  }, [propostaIdDestacada]);

  const carregar = useCallback(async (exibirCarregamento = true) => {
    if (exibirCarregamento) setCarregando(true);
    setErro("");

    try {
      setHistorico(await buscarHistoricoDoCliente());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o histórico de serviços."
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  const itensFiltrados = useMemo(
    () => historico.filter((item) => pertenceAoFiltro(item.status, filtro)),
    [filtro, historico]
  );

  function atualizar() {
    setAtualizando(true);
    void carregar(false);
  }

  function avaliarPrestador(item: HistoricoCliente) {
    router.push({
      pathname: "/review",
      params: {
        propostaId: String(item.propostaId),
        prestadorId: String(item.prestadorId),
        professional: item.nomePrestador,
      },
    });
  }

  function contratarNovamente(item: HistoricoCliente) {
    router.push({
      pathname: "/send-proposal",
      params: {
        prestadorId: String(item.prestadorId),
        professional: item.nomePrestador,
        service: item.titulo,
        serviceOptions: JSON.stringify([item.titulo]),
        initialDescription: item.descricao,
        initialLocation: item.localizacao ?? "",
        initialUrgency: urgenciaParaTela(item.urgencia),
      },
    });
  }

  async function conversarNoWhatsApp(item: HistoricoCliente) {
    setAbrindoWhatsAppId(item.propostaId);

    try {
      const contato = await buscarContatoWhatsApp(item.propostaId);
      await Linking.openURL(contato.whatsappUrl);
    } catch (error) {
      Alert.alert(
        "Não foi possível abrir o WhatsApp",
        error instanceof Error
          ? error.message
          : "Tente novamente em alguns instantes."
      );
    } finally {
      setAbrindoWhatsAppId(null);
    }
  }

  function posicionarProposta(event: LayoutChangeEvent, propostaId: number) {
    if (propostaId !== propostaIdDestacada || navegouAtePropostaRef.current) return;
    navegouAtePropostaRef.current = true;
    const y = Math.max(0, event.nativeEvent.layout.y - 12);
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 100);
  }

  async function responderConclusao(item: HistoricoCliente, confirmar: boolean) {
    if (respondendoConclusaoId != null) return;
    setRespondendoConclusaoId(item.propostaId);
    try {
      if (confirmar) {
        await confirmarConclusao(item.propostaId);
      } else {
        await naoConfirmarConclusao(item.propostaId);
      }
      setHistorico((atual) => atual.map((proposta) =>
        proposta.propostaId === item.propostaId
          ? { ...proposta,
              status: confirmar ? "FINALIZADA" : "ACEITA",
              valorCobrado: confirmar ? proposta.valorCobrado : null }
          : proposta));
    } catch (error) {
      Alert.alert("Não foi possível responder", error instanceof Error
        ? error.message : "Tente novamente em instantes.");
      void carregar(false);
    } finally {
      setRespondendoConclusaoId(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader
        title="Histórico de serviços"
        subtitle="Acompanhe todas as suas solicitações"
      />

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Carregando histórico...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={46} color={Colors.error} />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizar}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {filtros.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterButton, filtro === item.id && styles.filterButtonActive]}
                onPress={() => setFiltro(item.id)}
              >
                <Text style={[styles.filterText, filtro === item.id && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {itensFiltrados.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="history" size={38} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
              <Text style={styles.emptyText}>
                {historico.length === 0
                  ? "As propostas enviadas por você aparecerão aqui."
                  : "Não existem serviços nessa situação."}
              </Text>
            </View>
          ) : (
            itensFiltrados.map((item) => {
              const status = statusConfig[item.status];
              return (
                <View
                  key={item.propostaId}
                  onLayout={(event) => posicionarProposta(event, item.propostaId)}
                  style={[
                    styles.historyCard,
                    item.propostaId === propostaIdDestacada && styles.highlightedCard,
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardTitleContent}>
                      <Text style={styles.cardTitle}>{item.titulo}</Text>
                      <View style={styles.providerRow}>
                        <MaterialIcons name="person-outline" size={17} color={Colors.textSecondary} />
                        <Text style={styles.providerText}>{item.nomePrestador}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                      <MaterialIcons name={status.icon} size={14} color={status.color} />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.description} numberOfLines={3}>
                    {item.descricao}
                  </Text>

                  <View style={styles.cardBottom}>
                    {(item.status === "FINALIZADA" || item.status === "AGUARDANDO_CONFIRMACAO") && item.valorCobrado != null ? (
                      <View>
                        <Text style={styles.metaLabel}>{item.status === "AGUARDANDO_CONFIRMACAO" ? "Valor informado pelo prestador" : "Valor cobrado (informado pelo prestador)"}</Text>
                        <Text style={styles.valueText}>{formatarValor(item.valorCobrado)}</Text>
                      </View>
                    ) : item.valor != null ? (
                      <View>
                        <Text style={styles.metaLabel}>Valor da proposta</Text>
                        <Text style={styles.valueText}>{formatarValor(item.valor)}</Text>
                      </View>
                    ) : <View />}
                    <View style={styles.dateRow}>
                      <MaterialIcons name="event" size={16} color={Colors.textSecondary} />
                      <Text style={styles.dateText}>{formatarData(item.dataCriacao)}</Text>
                    </View>
                  </View>

                  {item.status === "ACEITA" || item.status === "AGUARDANDO_CONFIRMACAO" ? (
                    <TouchableOpacity
                      style={styles.whatsappButton}
                      onPress={() => void conversarNoWhatsApp(item)}
                      disabled={abrindoWhatsAppId === item.propostaId}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Conversar com ${item.nomePrestador} pelo WhatsApp`}
                    >
                      {abrindoWhatsAppId === item.propostaId ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <MaterialIcons name="chat" size={19} color={Colors.white} />
                      )}
                      <Text style={styles.whatsappButtonText}>
                        Conversar no WhatsApp
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {item.status === "AGUARDANDO_CONFIRMACAO" ? (
                    <View style={styles.confirmationBox}>
                      <Text style={styles.confirmationText}>
                        O prestador informou que terminou o serviço. Você confirma a conclusão?
                      </Text>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => void responderConclusao(item, true)}
                        disabled={respondendoConclusaoId != null}
                        accessibilityRole="button"
                      >
                        {respondendoConclusaoId === item.propostaId
                          ? <ActivityIndicator size="small" color={Colors.white} />
                          : <Text style={styles.confirmButtonText}>Confirmar conclusão</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.notFinishedButton}
                        onPress={() => void responderConclusao(item, false)}
                        disabled={respondendoConclusaoId != null}
                        accessibilityRole="button"
                      >
                        <Text style={styles.notFinishedButtonText}>Serviço ainda não concluído</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.actionsRow}>
                    {item.status === "FINALIZADA" && item.notaPrestador == null ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.reviewButton]}
                        onPress={() => avaliarPrestador(item)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`Avaliar ${item.nomePrestador}`}
                      >
                        <MaterialIcons name="star-outline" size={18} color={Colors.primary} />
                        <Text style={styles.reviewButtonText} numberOfLines={1}>
                          Avaliar prestador
                        </Text>
                      </TouchableOpacity>
                    ) : item.status === "FINALIZADA" && item.notaPrestador != null ? (
                      <View style={[styles.actionButton, styles.reviewCompleted]}>
                        <MaterialIcons name="star" size={18} color={Colors.warning} />
                        <Text style={styles.reviewCompletedText} numberOfLines={1}>
                          Avaliado: {Number(item.notaPrestador).toFixed(1)}
                        </Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={[styles.actionButton, styles.hireAgainButton]}
                      onPress={() => contratarNovamente(item)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Contratar ${item.nomePrestador} novamente`}
                    >
                      <MaterialIcons name="replay" size={18} color={Colors.white} />
                      <Text style={styles.hireAgainButtonText} numberOfLines={1}>
                        Contratar novamente
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  stateText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.error, fontSize: 14, textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: { color: Colors.white, fontWeight: "700" },
  container: { padding: 18, paddingBottom: 42 },
  filters: { gap: 9, paddingBottom: 18, paddingHorizontal: 1 },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: Colors.white },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  highlightedCard: { borderColor: Colors.primary, borderWidth: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitleContent: { flex: 1 },
  cardTitle: { color: "#111", fontSize: 16, fontWeight: "800", lineHeight: 21 },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  providerText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 13 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 15,
    paddingTop: 13,
  },
  metaLabel: { color: Colors.textSecondary, fontSize: 10, marginBottom: 2 },
  valueText: { color: Colors.primary, fontSize: 16, fontWeight: "800" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  dateText: { color: Colors.textSecondary, fontSize: 11 },
  whatsappButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
  },
  whatsappButtonText: { color: Colors.white, fontSize: 13, fontWeight: "800" },
  confirmationBox: { marginTop: 14, padding: 13, borderRadius: 12, backgroundColor: "#FFF7EA", gap: 9 },
  confirmationText: { color: Colors.ink, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  confirmButton: { minHeight: 44, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  confirmButtonText: { color: Colors.white, fontSize: 13, fontWeight: "800" },
  notFinishedButton: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  notFinishedButtonText: { color: Colors.primary, fontSize: 13, fontWeight: "800" },
  actionsRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  reviewButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  reviewButtonText: { color: Colors.primary, fontSize: 11, fontWeight: "800" },
  reviewCompleted: {
    backgroundColor: "#FFF7EA",
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  reviewCompletedText: { color: Colors.warning, fontSize: 11, fontWeight: "700" },
  hireAgainButton: { backgroundColor: Colors.primary },
  hireAgainButtonText: { color: Colors.white, fontSize: 11, fontWeight: "800" },
  emptyCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    marginTop: 5,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: { color: "#111", fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7 },
});
