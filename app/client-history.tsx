import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import {
  buscarHistoricoDoCliente,
  type HistoricoCliente,
  type StatusProposta,
} from "../services/propostaService";

type FiltroHistorico = "TODOS" | "ATIVOS" | "FINALIZADOS" | "ENCERRADOS";

const statusConfig: Record<
  StatusProposta,
  { label: string; color: string; background: string; icon: "schedule" | "handshake" | "cancel" | "block" | "check-circle" }
> = {
  PENDENTE: { label: "Aguardando", color: "#C05A19", background: "#FFF0E6", icon: "schedule" },
  ACEITA: { label: "Em andamento", color: "#2E7D32", background: "#EAFAF1", icon: "handshake" },
  RECUSADA: { label: "Recusada", color: "#B3261E", background: "#FDECEA", icon: "cancel" },
  CANCELADA: { label: "Cancelada", color: "#6B6B6B", background: "#EFEFF2", icon: "block" },
  FINALIZADA: { label: "Concluída", color: "#0D3D8B", background: "#E8EDFA", icon: "check-circle" },
};

const filtros: { id: FiltroHistorico; label: string }[] = [
  { id: "TODOS", label: "Todos" },
  { id: "ATIVOS", label: "Em andamento" },
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

function pertenceAoFiltro(status: StatusProposta, filtro: FiltroHistorico) {
  if (filtro === "TODOS") return true;
  if (filtro === "ATIVOS") return status === "PENDENTE" || status === "ACEITA";
  if (filtro === "FINALIZADOS") return status === "FINALIZADA";
  return status === "RECUSADA" || status === "CANCELADA";
}

export default function ClientHistoryScreen() {
  const router = useRouter();
  const [historico, setHistorico] = useState<HistoricoCliente[]>([]);
  const [filtro, setFiltro] = useState<FiltroHistorico>("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

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
        initialTitle: item.titulo,
        initialDescription: item.descricao,
        initialBudget: Number(item.valor).toFixed(2).replace(".", ","),
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Histórico de serviços</Text>
          <Text style={styles.headerSubtitle}>Acompanhe todas as suas solicitações</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Carregando histórico...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={46} color="#B3261E" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
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
                <View key={item.propostaId} style={styles.historyCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTitleContent}>
                      <Text style={styles.cardTitle}>{item.titulo}</Text>
                      <View style={styles.providerRow}>
                        <MaterialIcons name="person-outline" size={17} color="#777780" />
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
                    <View>
                      <Text style={styles.metaLabel}>Valor da proposta</Text>
                      <Text style={styles.valueText}>{formatarValor(item.valor)}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <MaterialIcons name="event" size={16} color="#888892" />
                      <Text style={styles.dateText}>{formatarData(item.dataCriacao)}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
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

                    <TouchableOpacity
                      style={[styles.actionButton, styles.hireAgainButton]}
                      onPress={() => contratarNovamente(item)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Contratar ${item.nomePrestador} novamente`}
                    >
                      <MaterialIcons name="replay" size={18} color="#fff" />
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
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  header: {
    minHeight: 88,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerContent: { flex: 1, alignItems: "center" },
  headerSpacer: { width: 44 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#FFE4D8", fontSize: 12, marginTop: 3, textAlign: "center" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  stateText: { color: "#777780", fontSize: 14 },
  errorText: { color: "#B3261E", fontSize: 14, textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  container: { padding: 18, paddingBottom: 42 },
  filters: { gap: 9, paddingBottom: 18, paddingHorizontal: 1 },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E1E1E5",
  },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: "#66666F", fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: "#fff" },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitleContent: { flex: 1 },
  cardTitle: { color: "#111", fontSize: 16, fontWeight: "800", lineHeight: 21 },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  providerText: { color: "#66666F", fontSize: 12, fontWeight: "600" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  description: { color: "#555B68", fontSize: 13, lineHeight: 19, marginTop: 13 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEF2",
    marginTop: 15,
    paddingTop: 13,
  },
  metaLabel: { color: "#8A8A94", fontSize: 10, marginBottom: 2 },
  valueText: { color: Colors.primary, fontSize: 16, fontWeight: "800" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  dateText: { color: "#777780", fontSize: 11 },
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  reviewButtonText: { color: Colors.primary, fontSize: 11, fontWeight: "800" },
  hireAgainButton: { backgroundColor: Colors.primary },
  hireAgainButtonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    marginTop: 5,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFF0EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: { color: "#111", fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { color: "#777780", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7 },
});
