import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  buscarDemandaDisponivel,
  enviarCandidatura,
  type DemandaDisponivel,
  type UrgenciaDemanda,
} from "../../services/demandaService";

const BLUE = "#174583";
const urgencyConfig: Record<UrgenciaDemanda, { label: string; color: string; background: string }> = {
  NORMAL: { label: "Normal", color: "#24753A", background: "#EAF7ED" },
  URGENTE: { label: "Urgente", color: "#B3261E", background: "#FDECEA" },
  HOJE: { label: "Para hoje", color: "#986600", background: "#FFF4CE" },
};

function formatarData(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function FotoDemanda({ foto, index }: { foto: DemandaDisponivel["fotos"][number]; index: number }) {
  const [falhou, setFalhou] = useState(false);
  const cacheKey = foto.url.replace(/[?#].*$/, "");

  useEffect(() => setFalhou(false), [foto.url]);

  return (
    <View style={styles.photoFrame}>
      {falhou ? (
        <View style={styles.photoError}>
          <MaterialIcons name="broken-image" size={32} color="#738098" />
          <Text style={styles.photoErrorText}>Não foi possível carregar esta foto.</Text>
        </View>
      ) : (
        <Image
          source={{ uri: foto.url, cacheKey }}
          recyclingKey={cacheKey}
          style={styles.photo}
          contentFit="contain"
          cachePolicy="disk"
          transition={180}
          accessibilityLabel={`Foto ${index + 1} da demanda`}
          onError={() => setFalhou(true)}
        />
      )}
    </View>
  );
}

export default function AvailableDemandDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = rawId && /^\d+$/.test(rawId) ? Number(rawId) : NaN;
  const [demanda, setDemanda] = useState<DemandaDisponivel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviandoCandidatura, setEnviandoCandidatura] = useState(false);
  const [erroCandidatura, setErroCandidatura] = useState("");
  const requestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const focusedRef = useRef(false);

  const carregar = useCallback(async (refresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const request = ++requestRef.current;
    setErro("");
    setAtualizando(refresh);
    setCarregando(!refresh);
    if (!refresh) setDemanda(null);

    try {
      if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error("A demanda informada é inválida. Volte para a lista de demandas.");
      }
      const resultado = await buscarDemandaDisponivel(id, controller.signal);
      if (focusedRef.current && request === requestRef.current && !controller.signal.aborted) {
        setDemanda(resultado);
      }
    } catch (error) {
      if (focusedRef.current && request === requestRef.current && !controller.signal.aborted) {
        // Não manter detalhes antigos quando a demanda deixa de estar disponível.
        setDemanda(null);
        setErro(error instanceof Error ? error.message : "Não foi possível carregar a demanda.");
      }
    } finally {
      if (focusedRef.current && request === requestRef.current && !controller.signal.aborted) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, [id]);

  useFocusEffect(useCallback(() => {
    focusedRef.current = true;
    void carregar();
    return () => {
      focusedRef.current = false;
      requestRef.current += 1;
      abortRef.current?.abort();
    };
  }, [carregar]));

  const urgencia = demanda ? urgencyConfig[demanda.urgencia] ?? urgencyConfig.NORMAL : null;
  const fotos = [...(demanda?.fotos ?? [])].sort((a, b) => a.ordem - b.ordem);

  async function candidatar() {
    if (!demanda || enviandoCandidatura) return;
    const textoValor = valor.trim();
    const valorNumerico = Number(
      textoValor.includes(",")
        ? textoValor.replace(/\./g, "").replace(",", ".")
        : textoValor
    );
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErroCandidatura("Informe um valor válido para a sua proposta.");
      return;
    }

    setEnviandoCandidatura(true);
    setErroCandidatura("");
    try {
      const candidatura = await enviarCandidatura(demanda.id, valorNumerico, mensagem);
      setDemanda((atual) => atual ? {
        ...atual,
        candidaturaId: candidatura.id,
        statusCandidatura: candidatura.status,
      } : atual);
      Alert.alert("Candidatura enviada", "O cliente já pode analisar a sua proposta.");
    } catch (error) {
      setErroCandidatura(error instanceof Error ? error.message : "Não foi possível enviar sua candidatura.");
    } finally {
      setEnviandoCandidatura(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/professional-demands")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Voltar para demandas"
          >
            <MaterialIcons name="arrow-back" size={25} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Detalhes da demanda</Text>
            <Text style={styles.headerSubtitle}>Publicação do cliente</Text>
          </View>
        </View>
      </View>

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.stateText}>Carregando demanda...</Text>
        </View>
      ) : erro || !demanda ? (
        <View style={styles.centerState}>
          <MaterialIcons name="info-outline" size={42} color={BLUE} />
          <Text style={styles.stateTitle}>Não foi possível exibir a demanda</Text>
          <Text style={styles.stateText}>{erro || "Esta demanda não está disponível."}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void carregar()}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void carregar(true)} colors={[BLUE]} tintColor={BLUE} />}
        >
          <View style={styles.card}>
            <Text style={styles.category}>{demanda.categoria}</Text>
            <Text style={styles.title}>{demanda.titulo}</Text>
            <View style={styles.badges}>
              <View style={styles.openBadge}>
                <MaterialIcons name="campaign" size={16} color={BLUE} />
                <Text style={styles.openText}>Demanda aberta</Text>
              </View>
              {urgencia ? (
                <View style={[styles.badge, { backgroundColor: urgencia.background }]}>
                  <MaterialIcons name="schedule" size={15} color={urgencia.color} />
                  <Text style={[styles.badgeText, { color: urgencia.color }]}>{urgencia.label}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.dateText}>Publicada em {formatarData(demanda.criadoEm)}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person-outline" size={24} color={BLUE} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Cliente</Text>
                <Text style={styles.infoValue}>{demanda.nomeCliente || "Cliente"}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="star-outline" size={24} color={BLUE} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Avaliação do cliente</Text>
                {demanda.totalAvaliacoesCliente != null && demanda.totalAvaliacoesCliente > 0 ? (
                  <View style={styles.ratingLine}>
                    <MaterialIcons name="star" size={18} color="#E5A000" />
                    <Text style={styles.ratingValue}>
                      {Number(demanda.mediaAvaliacoesCliente ?? 0).toFixed(1).replace(".", ",")} / 5
                    </Text>
                    <Text style={styles.ratingCount}>
                      · {demanda.totalAvaliacoesCliente} {demanda.totalAvaliacoesCliente === 1 ? "avaliação" : "avaliações"}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noRating}>Ainda sem avaliações</Text>
                )}
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="payments" size={23} color={BLUE} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Orçamento</Text>
                <Text style={styles.infoValue}>{demanda.orcamento == null ? "A combinar" : Number(demanda.orcamento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={24} color={BLUE} />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Localização informada</Text>
                <Text style={styles.infoValue}>{demanda.localizacao}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Descrição do serviço</Text>
            <Text style={styles.description}>{demanda.descricao}</Text>
          </View>

          {fotos.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Fotos da demanda ({fotos.length})</Text>
              <View style={styles.photos}>
                {fotos.map((foto, index) => <FotoDemanda key={foto.id} foto={foto} index={index} />)}
              </View>
            </View>
          ) : null}

          <View style={[styles.card, styles.applicationCard]}>
            <View style={styles.applicationHeader}>
              <MaterialIcons name="handshake" size={25} color={BLUE} />
              <View style={styles.infoContent}>
                <Text style={styles.sectionTitle}>Candidatura</Text>
                <Text style={styles.applicationHint}>
                  {demanda.candidaturaId
                    ? "Sua candidatura já foi enviada ao cliente."
                    : "Envie seu valor e demonstre interesse neste serviço."}
                </Text>
              </View>
            </View>

            {demanda.candidaturaId ? (
              <View style={styles.applicationSent}>
                <MaterialIcons name="check-circle" size={20} color="#24753A" />
                <Text style={styles.applicationSentText}>
                  {demanda.statusCandidatura === "PENDENTE"
                    ? "Aguardando a escolha do cliente"
                    : demanda.statusCandidatura === "ACEITA"
                      ? "Você foi selecionado"
                      : "Candidatura encerrada"}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.inputLabel}>Valor da proposta</Text>
                <View style={styles.valueInputRow}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.valueInput}
                    value={valor}
                    onChangeText={(text) => {
                      setValor(text.replace(/[^0-9.,]/g, ""));
                      setErroCandidatura("");
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor="#94A3B8"
                    maxLength={15}
                    accessibilityLabel="Valor da proposta"
                  />
                </View>
                <Text style={styles.inputLabel}>Mensagem para o cliente (opcional)</Text>
                <TextInput
                  style={styles.messageInput}
                  value={mensagem}
                  onChangeText={(text) => {
                    setMensagem(text);
                    setErroCandidatura("");
                  }}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  placeholder="Conte brevemente por que você é uma boa opção para este serviço."
                  placeholderTextColor="#94A3B8"
                  accessibilityLabel="Mensagem da candidatura"
                />
                <Text style={styles.characterCount}>{mensagem.length}/500</Text>
                {!!erroCandidatura && <Text accessibilityRole="alert" style={styles.applicationError}>{erroCandidatura}</Text>}
                <TouchableOpacity
                  style={[styles.applyButton, enviandoCandidatura && styles.applyButtonDisabled]}
                  onPress={() => void candidatar()}
                  disabled={enviandoCandidatura}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                >
                  {enviandoCandidatura ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="send" size={20} color="#fff" />
                      <Text style={styles.applyButtonText}>Enviar candidatura</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F5F9" },
  header: { backgroundColor: BLUE, paddingHorizontal: 18, paddingBottom: 21 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 13, width: "100%", maxWidth: 760, alignSelf: "center" },
  backButton: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#FFFFFF1F", alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 21, fontWeight: "800" },
  headerSubtitle: { color: "#D2DEF1", fontSize: 12, marginTop: 4 },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 26, gap: 13 },
  stateTitle: { fontSize: 18, color: "#192B43", fontWeight: "700", textAlign: "center" },
  stateText: { color: "#647086", fontSize: 14, lineHeight: 21, textAlign: "center" },
  retryButton: { marginTop: 6, minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: BLUE, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  content: { padding: 18, paddingBottom: 32, gap: 16, width: "100%", maxWidth: 796, alignSelf: "center" },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 21, gap: 14, borderWidth: 1, borderColor: "#E8ECF3" },
  category: { color: BLUE, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: "#162439", fontSize: 25, lineHeight: 32, fontWeight: "800" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  openBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: "#EDF2FB" },
  openText: { color: BLUE, fontSize: 12, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  dateText: { color: "#738098", fontSize: 12, lineHeight: 18 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 4 },
  infoContent: { flex: 1, gap: 5 },
  label: { color: "#738098", fontSize: 12 },
  infoValue: { color: "#23344A", fontSize: 16, lineHeight: 23, fontWeight: "600" },
  ratingLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  ratingValue: { color: "#23344A", fontSize: 16, fontWeight: "700" },
  ratingCount: { color: "#647086", fontSize: 13 },
  noRating: { color: "#647086", fontSize: 14 },
  sectionTitle: { color: "#23344A", fontSize: 17, fontWeight: "700" },
  description: { color: "#4B586C", fontSize: 15, lineHeight: 24 },
  photos: { gap: 14 },
  photoFrame: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#EEF1F6", borderRadius: 14, overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  photoError: { flex: 1, alignItems: "center", justifyContent: "center", padding: 18, gap: 8 },
  photoErrorText: { color: "#738098", fontSize: 13, textAlign: "center" },
  applicationCard: { borderColor: "#C7D7EE" },
  applicationHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  applicationHint: { color: "#647086", fontSize: 13, lineHeight: 19, marginTop: 3 },
  inputLabel: { color: "#334155", fontSize: 13, fontWeight: "700", marginBottom: -7 },
  valueInputRow: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#F8FAFC", flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  currencyPrefix: { color: "#334155", fontSize: 16, fontWeight: "700", marginRight: 7 },
  valueInput: { flex: 1, color: "#0F172A", fontSize: 16, paddingVertical: 13 },
  messageInput: { minHeight: 112, borderRadius: 14, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#F8FAFC", color: "#0F172A", fontSize: 14, lineHeight: 20, padding: 14 },
  characterCount: { alignSelf: "flex-end", color: "#64748B", fontSize: 11, marginTop: -8 },
  applicationError: { color: "#B3261E", fontSize: 13, lineHeight: 19 },
  applyButton: { minHeight: 52, borderRadius: 14, backgroundColor: BLUE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  applyButtonDisabled: { opacity: 0.65 },
  applyButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  applicationSent: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#EAF7ED", padding: 14, borderRadius: 14 },
  applicationSentText: { flex: 1, color: "#24753A", fontSize: 14, fontWeight: "700" },
});
