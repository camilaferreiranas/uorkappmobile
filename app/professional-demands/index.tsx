import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { DemandasDisponiveisLista } from "../../components/ui/demandas-disponiveis";
import { StarRating } from "../../components/ui/star-rating";
import { type Categoria } from "../../services/categoriaService";
import { type OrdenacaoDemanda } from "../../services/demandaService";
import {
  avaliarCliente,
  buscarDemandasDoPrestador,
  finalizarProposta,
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
  const { aba: abaInicial } = useLocalSearchParams<{ aba?: string }>();
  const [aba, setAba] = useState<"disponiveis" | "recebidas">(
    abaInicial === "recebidas" ? "recebidas" : "disponiveis"
  );
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | null>(null);
  const [ordenacaoFiltro, setOrdenacaoFiltro] = useState<OrdenacaoDemanda>("RECENTES");
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const wide = width >= 700;
  const [demandas, setDemandas] = useState<DemandaProfissional[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [finalizacaoPendente, setFinalizacaoPendente] =
    useState<DemandaProfissional | null>(null);
  const [valorCobradoTexto, setValorCobradoTexto] = useState("");
  const [erroFinalizacao, setErroFinalizacao] = useState("");
  const [avaliacaoPendente, setAvaliacaoPendente] =
    useState<DemandaProfissional | null>(null);
  const [notaCliente, setNotaCliente] = useState(0);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState("");
  const carregamentoId = useRef(0);
  const novas = demandas.filter((demanda) => demanda.status === "PENDENTE").length;
  const emAndamento = demandas.filter((demanda) => demanda.status === "ACEITA").length;
  const concluidas = demandas.filter((demanda) => demanda.status === "FINALIZADA").length;

  const carregar = useCallback(async (exibirCarregamento = true) => {
    const id = ++carregamentoId.current;
    if (exibirCarregamento) setCarregando(true);
    setErro("");

    try {
      const resultado = await buscarDemandasDoPrestador();
      if (id === carregamentoId.current) setDemandas(resultado);
    } catch (error) {
      if (id === carregamentoId.current) setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as demandas."
      );
    } finally {
      if (id === carregamentoId.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (aba === "recebidas") void carregar();
      return () => {
        carregamentoId.current += 1;
      };
    }, [aba, carregar])
  );

  useEffect(() => {
    if (abaInicial === "disponiveis" || abaInicial === "recebidas") setAba(abaInicial);
  }, [abaInicial]);

  function atualizar() {
    setAtualizando(true);
    void carregar(false);
  }

  function abrirFinalizacao(demanda: DemandaProfissional) {
    setFinalizacaoPendente(demanda);
    setValorCobradoTexto("");
    setErroFinalizacao("");
  }

  async function finalizar() {
    const demanda = finalizacaoPendente;
    if (!demanda) return;

    const texto = valorCobradoTexto.trim();
    const valorCobrado = Number(texto.replace(",", "."));
    if (!/^\d+(?:[,.]\d{1,2})?$/.test(texto)
      || !Number.isFinite(valorCobrado)
      || valorCobrado > 99999999.99) {
      setErroFinalizacao("Informe um valor válido em reais (ex.: 150,00). Use 0,00 se não houve cobrança.");
      return;
    }

    setProcessandoId(demanda.propostaId);
    setErroFinalizacao("");
    try {
      await finalizarProposta(demanda.propostaId, valorCobrado);
      const finalizada = { ...demanda, valorCobrado, status: "FINALIZADA" as const };
      setDemandas((atuais) =>
        atuais.map((item) =>
          item.propostaId === demanda.propostaId ? finalizada : item
        )
      );
      Keyboard.dismiss();
      setFinalizacaoPendente(null);
      abrirAvaliacao(finalizada);
    } catch (error) {
      setErroFinalizacao(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar o serviço."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  function abrirAvaliacao(demanda: DemandaProfissional) {
    setAvaliacaoPendente(demanda);
    setNotaCliente(0);
    setErroAvaliacao("");
  }

  async function enviarAvaliacao() {
    if (!avaliacaoPendente || notaCliente === 0) return;

    setEnviandoAvaliacao(true);
    setErroAvaliacao("");
    try {
      await avaliarCliente(avaliacaoPendente.propostaId, notaCliente);
      setDemandas((atuais) =>
        atuais.map((item) =>
          item.propostaId === avaliacaoPendente.propostaId
            ? { ...item, notaCliente }
            : item
        )
      );
      setAvaliacaoPendente(null);
    } catch (error) {
      setErroAvaliacao(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a avaliação."
      );
    } finally {
      setEnviandoAvaliacao(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16 },
          compact && styles.headerCompact,
        ]}
      >
        <Text style={[styles.headerTitle, compact && styles.headerTitleCompact]}>
          Demandas
        </Text>
        <Text style={styles.headerSubtitle}>
          {aba === "disponiveis" ? "Veja todas as publicações abertas" : demandas.length === 1
            ? "1 demanda encontrada"
            : `${demandas.length} demandas encontradas`}
        </Text>
      </View>

      <View style={styles.tabs}>
        {(["disponiveis", "recebidas"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tab, aba === item && styles.tabActive]}
            onPress={() => setAba(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: aba === item }}
          >
            <Text style={[styles.tabText, aba === item && styles.tabTextActive]}>
              {item === "disponiveis" ? "Disponíveis" : "Recebidas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {aba === "disponiveis" ? (
        <DemandasDisponiveisLista
          categoriaSelecionada={categoriaFiltro}
          onSelecionarCategoria={setCategoriaFiltro}
          ordenacaoSelecionada={ordenacaoFiltro}
          onSelecionarOrdenacao={setOrdenacaoFiltro}
        />
      ) : carregando ? (
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
        <FlatList
          key={wide ? "duas-colunas" : "uma-coluna"}
          data={demandas}
          keyExtractor={(demanda) => String(demanda.propostaId)}
          numColumns={wide ? 2 : 1}
          columnWrapperStyle={wide ? styles.demandRow : undefined}
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
          ListHeaderComponent={
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
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="assignment-turned-in" size={38} color="#0D3D8B" />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma demanda encontrada</Text>
              <Text style={styles.emptyText}>
                As propostas recebidas aparecerão aqui, independentemente do status.
              </Text>
            </View>
          }
          renderItem={({ item: demanda }) => {
            const status = statusConfig[demanda.status];
            const pendente = demanda.status === "PENDENTE";
            const demandaEmAndamento = demanda.status === "ACEITA";
            const aguardandoAvaliacao =
              demanda.status === "FINALIZADA" && demanda.notaCliente == null;

            return (
              <TouchableOpacity
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
                      urgency: demanda.urgencia === "URGENTE" ? "Urgente" : demanda.urgencia === "HOJE" ? "Hoje" : "Normal",
                      location: demanda.localizacao ?? "Localização não informada",
                      photoUrl: demanda.fotoUrl ?? "",
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

                {demanda.localizacao ? (
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={16} color="#7A7A95" />
                    <Text style={styles.locationText} numberOfLines={2}>{demanda.localizacao}</Text>
                  </View>
                ) : null}

                {pendente ? (
                  <Text style={styles.pendingHint}>Toque para responder à proposta</Text>
                ) : null}

                {demandaEmAndamento ? (
                  <TouchableOpacity
                    style={styles.finishButton}
                    onPress={() => abrirFinalizacao(demanda)}
                    disabled={processandoId === demanda.propostaId}
                  >
                    {processandoId === demanda.propostaId ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <MaterialIcons name="check-circle" size={18} color="#fff" />
                    )}
                    <Text style={styles.finishButtonText}>Finalizar serviço</Text>
                  </TouchableOpacity>
                ) : null}

                {aguardandoAvaliacao ? (
                  <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => abrirAvaliacao(demanda)}
                  >
                    <MaterialIcons name="star-outline" size={18} color="#0D3D8B" />
                    <Text style={styles.rateButtonText}>Avaliar cliente</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.cardBottom}>
                  {demanda.status === "FINALIZADA" && demanda.valorCobrado != null ? (
                    <View>
                      <Text style={styles.metaLabel}>Valor cobrado</Text>
                      <Text style={styles.budgetText}>{formatarValor(demanda.valorCobrado)}</Text>
                    </View>
                  ) : demanda.valor != null ? (
                    <View>
                      <Text style={styles.metaLabel}>Valor da candidatura</Text>
                      <Text style={styles.budgetText}>{formatarValor(demanda.valor)}</Text>
                    </View>
                  ) : <View />}
                  <View style={styles.dateBox}>
                    <MaterialIcons name="event" size={15} color="#7A7A95" />
                    <Text style={styles.dateText}>{formatarData(demanda.dataCriacao)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal
        visible={finalizacaoPendente != null || avaliacaoPendente != null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (processandoId != null || enviandoAvaliacao) return;
          setFinalizacaoPendente(null);
          setAvaliacaoPendente(null);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalCard}>
            {finalizacaoPendente ? (
              <>
                <View style={styles.modalIcon}>
                  <MaterialIcons name="payments" size={30} color="#0D3D8B" />
                </View>
                <Text style={styles.modalTitle}>Finalizar serviço</Text>
                <Text style={styles.modalText}>
                  Quanto foi cobrado por este serviço? Depois você poderá avaliar o cliente.
                </Text>
                <Text style={styles.amountLabel}>Valor cobrado (R$)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={valorCobradoTexto}
                  onChangeText={(texto) => {
                    setValorCobradoTexto(texto);
                    setErroFinalizacao("");
                  }}
                  keyboardType="decimal-pad"
                  placeholder="Ex.: 150,00"
                  accessibilityLabel="Valor cobrado pelo serviço em reais"
                  maxLength={12}
                  editable={processandoId == null}
                />
                <Text style={styles.amountHint}>Se não houve cobrança, informe 0,00.</Text>
                {erroFinalizacao ? <Text style={styles.modalError}>{erroFinalizacao}</Text> : null}
                <TouchableOpacity
                  style={[styles.submitRatingButton, processandoId != null && styles.disabledButton]}
                  disabled={processandoId != null}
                  onPress={() => void finalizar()}
                >
                  {processandoId != null ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitRatingText}>Confirmar finalização</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={() => setFinalizacaoPendente(null)}
                  disabled={processandoId != null}
                >
                  <Text style={styles.laterButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.modalIcon}>
                  <MaterialIcons name="person" size={30} color="#0D3D8B" />
                </View>
                <Text style={styles.modalTitle}>Avalie o cliente</Text>
                <Text style={styles.modalText}>
                  Como foi trabalhar com {avaliacaoPendente?.nomeCliente} neste serviço?
                </Text>
                <StarRating rating={notaCliente} onRatingChange={setNotaCliente} size={38} />
                {erroAvaliacao ? (
                  <Text style={styles.modalError}>{erroAvaliacao}</Text>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.submitRatingButton,
                    (notaCliente === 0 || enviandoAvaliacao) && styles.disabledButton,
                  ]}
                  disabled={notaCliente === 0 || enviandoAvaliacao}
                  onPress={() => void enviarAvaliacao()}
                >
                  {enviandoAvaliacao ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitRatingText}>Enviar avaliação</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={() => setAvaliacaoPendente(null)}
                  disabled={enviandoAvaliacao}
                >
                  <Text style={styles.laterButtonText}>Avaliar depois</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ProfessionalNavBar active="demandas" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", marginHorizontal: 16, marginTop: 14, marginBottom: 2, padding: 4, borderRadius: 16, backgroundColor: "#E2E8F0", gap: 4 },
  tab: { flex: 1, paddingVertical: 13, paddingHorizontal: 8, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: "#0D3D8B" },
  tabText: { color: "#475569", fontSize: 15, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F4FB",
  },
  header: {
    backgroundColor: "#0D3D8B",
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerCompact: {
    paddingHorizontal: 16,
    paddingBottom: 18,
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
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
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
    flex: 1,
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
  demandRow: {
    gap: 14,
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
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 9,
  },
  locationText: {
    flex: 1,
    color: "#7A7A95",
    fontSize: 11,
    lineHeight: 16,
  },
  pendingHint: {
    color: "#C05A19",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 10,
  },
  finishButton: {
    marginTop: 13,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: "#0D3D8B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  rateButton: {
    marginTop: 13,
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#0D3D8B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  rateButtonText: {
    color: "#0D3D8B",
    fontSize: 13,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#E8EDFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#111",
    fontSize: 21,
    fontWeight: "800",
  },
  modalText: {
    color: "#6B6B7A",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 18,
  },
  modalError: {
    color: "#B3261E",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  amountLabel: {
    alignSelf: "flex-start",
    color: "#111",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  amountInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#111",
    fontSize: 17,
    marginBottom: 7,
  },
  amountHint: {
    alignSelf: "flex-start",
    color: "#6B6B7A",
    fontSize: 12,
    marginBottom: 18,
  },
  submitRatingButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#0D3D8B",
    alignItems: "center",
    justifyContent: "center",
  },
  submitRatingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.55,
  },
  laterButton: {
    paddingHorizontal: 18,
    paddingTop: 15,
  },
  laterButtonText: {
    color: "#6B6B7A",
    fontSize: 13,
    fontWeight: "700",
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
