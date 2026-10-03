import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import {
  buscarDemandaDisponivel,
  enviarCandidatura,
  type DemandaDisponivel,
  type UrgenciaDemanda,
} from "../../services/demandaService";

const BLUE = Colors.primary;
const urgencyConfig: Record<UrgenciaDemanda, { label: string; color: string; background: string }> = {
  NORMAL: { label: "Normal", color: Colors.success, background: "#EAF7ED" },
  URGENTE: { label: "Urgente", color: Colors.warning, background: "#FFF7EA" },
  HOJE: { label: "Para hoje", color: Colors.error, background: "#FDECEA" },
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
          <MaterialIcons name="broken-image" size={32} color={Colors.textSecondary} />
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
  const scrollViewRef = useRef<ScrollView>(null);

  function manterMensagemVisivel() {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 250);
  }

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
            <MaterialIcons name="arrow-back" size={25} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Detalhes da demanda</Text>
            <Text style={styles.headerSubtitle}>Publicação do cliente</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            <MaterialIcons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.applicationSentText}>
                  {demanda.statusCandidatura === "PENDENTE"
                    ? "Aguardando a escolha do cliente"
                    : demanda.statusCandidatura === "ACEITA" || demanda.statusCandidatura === "AGUARDANDO_CONFIRMACAO"
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
                    placeholderTextColor={Colors.textSecondary}
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
                  onFocus={manterMensagemVisivel}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  placeholder="Conte brevemente por que você é uma boa opção para este serviço."
                  placeholderTextColor={Colors.textSecondary}
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
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <MaterialIcons name="send" size={20} color={Colors.white} />
                      <Text style={styles.applyButtonText}>Enviar candidatura</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoidingView: { flex: 1 },
  header: { backgroundColor: BLUE, paddingHorizontal: 18, paddingBottom: 21 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 13, width: "100%", maxWidth: 760, alignSelf: "center" },
  backButton: { width: 46, height: 46, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { color: Colors.white, fontSize: 21, fontWeight: "800" },
  headerSubtitle: { color: Colors.primaryLight, fontSize: 12, marginTop: 4 },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 26, gap: 13 },
  stateTitle: { fontSize: 18, color: Colors.ink, fontWeight: "700", textAlign: "center" },
  stateText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: "center" },
  retryButton: { marginTop: 6, minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: BLUE, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  content: { padding: 18, paddingBottom: 120, gap: 16, width: "100%", maxWidth: 796, alignSelf: "center" },
  card: { backgroundColor: Colors.white, padding: 20, borderRadius: 21, gap: 14, borderWidth: 1, borderColor: Colors.border },
  category: { color: BLUE, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: Colors.ink, fontSize: 25, lineHeight: 32, fontWeight: "700" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  openBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.primaryLight },
  openText: { color: BLUE, fontSize: 12, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  dateText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 4 },
  infoContent: { flex: 1, gap: 5 },
  label: { color: Colors.textSecondary, fontSize: 12 },
  infoValue: { color: Colors.ink, fontSize: 16, lineHeight: 23, fontWeight: "600" },
  ratingLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  ratingValue: { color: Colors.ink, fontSize: 16, fontWeight: "700" },
  ratingCount: { color: Colors.textSecondary, fontSize: 13 },
  noRating: { color: Colors.textSecondary, fontSize: 14 },
  sectionTitle: { color: Colors.ink, fontSize: 17, fontWeight: "700" },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
  photos: { gap: 14 },
  photoFrame: { width: "100%", aspectRatio: 4 / 3, backgroundColor: Colors.background, borderRadius: 14, overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  photoError: { flex: 1, alignItems: "center", justifyContent: "center", padding: 18, gap: 8 },
  photoErrorText: { color: Colors.textSecondary, fontSize: 13, textAlign: "center" },
  applicationCard: { borderColor: Colors.primaryLight },
  applicationHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  applicationHint: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 3 },
  inputLabel: { color: Colors.ink, fontSize: 13, fontWeight: "700", marginBottom: -7 },
  valueInputRow: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  currencyPrefix: { color: Colors.ink, fontSize: 16, fontWeight: "700", marginRight: 7 },
  valueInput: { flex: 1, color: Colors.ink, fontSize: 16, paddingVertical: 13 },
  messageInput: { minHeight: 112, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, color: Colors.ink, fontSize: 14, lineHeight: 20, padding: 14 },
  characterCount: { alignSelf: "flex-end", color: Colors.textSecondary, fontSize: 11, marginTop: -8 },
  applicationError: { color: Colors.error, fontSize: 13, lineHeight: 19 },
  applyButton: { minHeight: 52, borderRadius: 14, backgroundColor: BLUE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  applyButtonDisabled: { opacity: 0.65 },
  applyButtonText: { color: Colors.white, fontSize: 15, fontWeight: "800" },
  applicationSent: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#EAF7ED", padding: 14, borderRadius: 14 },
  applicationSentText: { flex: 1, color: Colors.success, fontSize: 14, fontWeight: "700" },
});
