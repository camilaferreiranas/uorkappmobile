import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import {
  buscarDemandasDoPrestador,
  type DemandaProfissional,
  type StatusProposta,
} from "../../services/propostaService";

const statusConfig: Record<
  StatusProposta,
  { label: string; color: string; background: string }
> = {
  PENDENTE: { label: "Pendente", color: "#C05A19", background: "#FFF0E6" },
  ACEITA: { label: "Em andamento", color: "#2E7D32", background: "#EAFAF1" },
  RECUSADA: { label: "Recusada", color: "#B3261E", background: "#FDECEA" },
  CANCELADA: { label: "Cancelada", color: "#6B6B6B", background: "#EFEFF2" },
  FINALIZADA: { label: "Finalizada", color: "#0D3D8B", background: "#E8EDFA" },
};

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

export default function ProfessionalDemandsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const [demandas, setDemandas] = useState<DemandaProfissional[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const novas = demandas.filter((demanda) => demanda.status === "PENDENTE").length;
  const emAndamento = demandas.filter((demanda) => demanda.status === "ACEITA").length;
  const concluidas = demandas.filter((demanda) => demanda.status === "FINALIZADA").length;

  const carregar = useCallback(async (exibirCarregamento = true) => {
    if (exibirCarregamento) setCarregando(true);
    setErro("");

    try {
      setDemandas(await buscarDemandasDoPrestador());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as demandas."
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

  function atualizar() {
    setAtualizando(true);
    void carregar(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <Text style={[styles.headerTitle, compact && styles.headerTitleCompact]}>
          Todas as demandas
        </Text>
        <Text style={styles.headerSubtitle}>
          {demandas.length === 1
            ? "1 demanda encontrada"
            : `${demandas.length} demandas encontradas`}
        </Text>
      </View>

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0D3D8B" />
          <Text style={styles.stateText}>Carregando demandas...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={44} color="#B3261E" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.container,
            compact && styles.containerCompact,
            demandas.length === 0 && styles.emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizar}
              colors={["#0D3D8B"]}
              tintColor="#0D3D8B"
            />
          }
        >
          <View style={[styles.summaryRow, compact && styles.summaryRowCompact]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, compact && styles.summaryValueCompact]}>
                {novas}
              </Text>
              <Text style={styles.summaryLabel}>Novas</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, compact && styles.summaryValueCompact]}>
                {emAndamento}
              </Text>
              <Text style={styles.summaryLabel}>Em andamento</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, compact && styles.summaryValueCompact]}>
                {concluidas}
              </Text>
              <Text style={styles.summaryLabel}>Concluídas</Text>
            </View>
          </View>

          {demandas.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="assignment-turned-in" size={38} color="#0D3D8B" />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma demanda encontrada</Text>
              <Text style={styles.emptyText}>
                As propostas recebidas aparecerão aqui, independentemente do status.
              </Text>
            </View>
          ) : (
            demandas.map((demanda) => {
              const status = statusConfig[demanda.status];
              const pendente = demanda.status === "PENDENTE";

              return (
              <TouchableOpacity
                key={demanda.propostaId}
                style={styles.demandCard}
                activeOpacity={pendente ? 0.75 : 1}
                disabled={!pendente}
                onPress={() =>
                  router.push({
                    pathname: "/demand-details",
                    params: {
                      id: String(demanda.propostaId),
                      title: demanda.titulo,
                      subtitle: "Proposta recebida",
                      budget: formatarValor(demanda.valor),
                      urgency: "Normal",
                      distance: "Distância indisponível",
                      client: demanda.nomeCliente,
                      description: demanda.descricao,
                    },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.demandTitle, compact && styles.demandTitleCompact]}>
                    {demanda.titulo}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.clientRow}>
                  <MaterialIcons name="person-outline" size={17} color="#7A7A95" />
                  <Text style={styles.clientText}>{demanda.nomeCliente}</Text>
                </View>

                <Text style={styles.description} numberOfLines={3}>
                  {demanda.descricao}
                </Text>

                {pendente ? (
                  <Text style={styles.pendingHint}>Toque para responder à proposta</Text>
                ) : null}

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.metaLabel}>Valor da proposta</Text>
                    <Text style={styles.budgetText}>{formatarValor(demanda.valor)}</Text>
                  </View>
                  <View style={styles.dateBox}>
                    <MaterialIcons name="event" size={15} color="#7A7A95" />
                    <Text style={styles.dateText}>{formatarData(demanda.dataCriacao)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <ProfessionalNavBar active="demandas" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F4FB",
  },
  header: {
    backgroundColor: "#0D3D8B",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
  },
  headerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerTitleCompact: {
    fontSize: 19,
  },
  headerSubtitle: {
    color: "#B8CCF6",
    fontSize: 13,
  },
  container: {
    padding: 20,
    paddingTop: 22,
    paddingBottom: 120,
  },
  containerCompact: {
    paddingHorizontal: 14,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 90,
    gap: 12,
  },
  summaryRow: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  summaryRowCompact: {
    paddingHorizontal: 6,
    paddingVertical: 17,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  summaryValue: {
    color: "#0D3D8B",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryValueCompact: {
    fontSize: 19,
  },
  summaryLabel: {
    color: "#8A8A8A",
    fontSize: 11,
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 3,
  },
  stateText: {
    color: "#7A7A95",
    fontSize: 14,
  },
  errorText: {
    color: "#B3261E",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0D3D8B",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#E8EDFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#111",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#7A7A95",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },
  demandCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  demandTitle: {
    flex: 1,
    color: "#111",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
  },
  demandTitleCompact: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  clientText: {
    color: "#6B6B7A",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    color: "#555B68",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  pendingHint: {
    color: "#C05A19",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 10,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F5",
    marginTop: 15,
    paddingTop: 13,
  },
  metaLabel: {
    color: "#8A8A98",
    fontSize: 10,
    marginBottom: 2,
  },
  budgetText: {
    color: "#0D3D8B",
    fontSize: 16,
    fontWeight: "800",
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  dateText: {
    color: "#7A7A95",
    fontSize: 11,
  },
});
