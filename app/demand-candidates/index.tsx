import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { ProfileAvatar } from "../../components/ui/profile-avatar";
import { buscarContatoWhatsApp } from "../../services/propostaService";
import {
  buscarCandidaturasDaDemanda,
  selecionarCandidatura,
  type CandidaturaDemanda,
  type CandidaturasDaDemanda,
} from "../../services/demandaService";

const statusConfig = {
  PENDENTE: { label: "Aguardando escolha", color: Colors.warning, background: "#FFF7EA" },
  ACEITA: { label: "Selecionado", color: Colors.primary, background: Colors.primaryLight },
  AGUARDANDO_CONFIRMACAO: { label: "Aguardando confirmação", color: Colors.warning, background: "#FFF7EA" },
  RECUSADA: { label: "Não selecionado", color: Colors.textSecondary, background: Colors.background },
  CANCELADA: { label: "Cancelado", color: Colors.error, background: "#FDECEA" },
  FINALIZADA: { label: "Serviço finalizado", color: Colors.success, background: "#EAF7ED" },
};

function formatarValor(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CandidatoCard({
  candidato,
  podeSelecionar,
  processando,
  onSelecionar,
  onAbrirPerfil,
  onConversar,
  abrindoWhatsApp,
}: {
  candidato: CandidaturaDemanda;
  podeSelecionar: boolean;
  processando: boolean;
  onSelecionar: () => void;
  onAbrirPerfil: () => void;
  onConversar: () => void;
  abrindoWhatsApp: boolean;
}) {
  const status = statusConfig[candidato.status];
  const iniciais = candidato.nomePrestador
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  return (
    <View
      style={[styles.card, (candidato.status === "ACEITA" || candidato.status === "AGUARDANDO_CONFIRMACAO") && styles.selectedCard]}
    >
      <TouchableOpacity
        style={styles.profileArea}
        onPress={onAbrirPerfil}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={`Abrir perfil de ${candidato.nomePrestador}`}
        accessibilityHint="Exibe as informações e avaliações do prestador"
      >
        <View style={styles.cardHeader}>
          <ProfileAvatar
            imageUrl={candidato.fotoPerfilUrl}
            initials={iniciais || "P"}
            size={48}
            backgroundColor={Colors.primaryLight}
            initialsColor={Colors.primary}
          />
          <View style={styles.professionalInfo}>
            <Text style={styles.professionalName}>{candidato.nomePrestador}</Text>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={16} color={Colors.warning} />
              <Text style={styles.ratingText}>
                {Number(candidato.mediaAvaliacoes || 0).toFixed(1)} · {candidato.totalAvaliacoes || 0} avaliações
              </Text>
            </View>
          </View>
          <Text style={[styles.statusBadge, { color: status.color, backgroundColor: status.background }]}>
            {status.label}
          </Text>
        </View>

        <View style={styles.offerRow}>
          <View>
            <Text style={styles.label}>Valor proposto</Text>
            <Text style={styles.value}>{formatarValor(candidato.valor)}</Text>
          </View>
          <MaterialIcons name="payments" size={25} color={Colors.primary} />
        </View>
        <Text style={styles.message}>{candidato.mensagem}</Text>
      </TouchableOpacity>

      {podeSelecionar && candidato.status === "PENDENTE" ? (
        <TouchableOpacity
          style={[styles.selectButton, processando && styles.disabled]}
          onPress={onSelecionar}
          disabled={processando}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          {processando ? <ActivityIndicator color={Colors.white} /> : (
            <>
              <MaterialIcons name="check-circle" size={20} color={Colors.white} />
              <Text style={styles.selectButtonText}>Selecionar prestador</Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}

      {candidato.status === "ACEITA" || candidato.status === "AGUARDANDO_CONFIRMACAO" ? (
        <TouchableOpacity
          style={[styles.whatsappButton, abrindoWhatsApp && styles.disabled]}
          onPress={onConversar}
          disabled={abrindoWhatsApp}
          accessibilityRole="button"
          accessibilityLabel={`Conversar com ${candidato.nomePrestador} no WhatsApp`}
          activeOpacity={0.8}
        >
          {abrindoWhatsApp ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <MaterialIcons name="chat" size={20} color={Colors.white} />
          )}
          <Text style={styles.whatsappButtonText}>
            {abrindoWhatsApp ? "Abrindo WhatsApp..." : "Conversar no WhatsApp"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function DemandCandidatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const demandaId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : NaN;
  const [dados, setDados] = useState<CandidaturasDaDemanda | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [abrindoWhatsAppId, setAbrindoWhatsAppId] = useState<number | null>(null);
  const [candidatoParaSelecionar, setCandidatoParaSelecionar] = useState<CandidaturaDemanda | null>(null);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const carregar = useCallback(async (refresh = false) => {
    const atual = ++requestId.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setErro("");
    setCarregando(!refresh);
    setAtualizando(refresh);
    try {
      if (!Number.isSafeInteger(demandaId) || demandaId <= 0) throw new Error("Demanda inválida.");
      const result = await buscarCandidaturasDaDemanda(demandaId, controller.signal);
      if (atual === requestId.current && !controller.signal.aborted) setDados(result);
    } catch (error) {
      if (atual === requestId.current && !controller.signal.aborted) {
        setErro(error instanceof Error ? error.message : "Não foi possível carregar as candidaturas.");
      }
    } finally {
      if (atual === requestId.current && !controller.signal.aborted) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, [demandaId]);

  useFocusEffect(useCallback(() => {
    void carregar();
    return () => {
      requestId.current += 1;
      abortRef.current?.abort();
    };
  }, [carregar]));

  function confirmarSelecao(candidato: CandidaturaDemanda) {
    setCandidatoParaSelecionar(candidato);
  }

  async function selecionar(candidato: CandidaturaDemanda) {
    setCandidatoParaSelecionar(null);
    setProcessandoId(candidato.id);
    setErro("");
    try {
      await selecionarCandidatura(demandaId, candidato.id);
      await carregar(true);
      Alert.alert("Prestador selecionado", "A demanda agora está em andamento.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível selecionar este prestador.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function conversarNoWhatsApp(candidato: CandidaturaDemanda) {
    if (abrindoWhatsAppId != null) return;
    setAbrindoWhatsAppId(candidato.id);
    try {
      const contato = await buscarContatoWhatsApp(candidato.id);
      await Linking.openURL(contato.whatsappUrl);
    } catch (error) {
      Alert.alert(
        "Não foi possível abrir o WhatsApp",
        error instanceof Error ? error.message : "Tente novamente em instantes."
      );
    } finally {
      setAbrindoWhatsAppId(null);
    }
  }

  const candidaturas = dados?.candidaturas ?? [];
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
          <MaterialIcons name="arrow-back" size={25} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Prestadores candidatos</Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>{dados?.titulo ?? "Escolha quem realizará o serviço"}</Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /><Text style={styles.centerText}>Carregando candidaturas...</Text></View>
      ) : erro && !dados ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={43} color={Colors.error} />
          <Text style={styles.centerTitle}>Não foi possível carregar</Text>
          <Text style={styles.centerText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={candidaturas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.content, candidaturas.length === 0 && styles.emptyContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void carregar(true)} colors={[Colors.primary]} tintColor={Colors.primary} />}
          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>{candidaturas.length} {candidaturas.length === 1 ? "candidatura recebida" : "candidaturas recebidas"}</Text>
              <Text style={styles.summaryText}>
                {dados?.status === "ABERTA" ? "Compare as propostas antes de selecionar um profissional." : "Esta demanda já possui um prestador selecionado."}
              </Text>
              {!!erro && <Text accessibilityRole="alert" style={styles.errorText}>{erro}</Text>}
            </View>
          }
          renderItem={({ item }) => (
            <CandidatoCard
              candidato={item}
              podeSelecionar={dados?.status === "ABERTA"}
              processando={processandoId === item.id}
              abrindoWhatsApp={abrindoWhatsAppId === item.id}
              onSelecionar={() => confirmarSelecao(item)}
              onConversar={() => void conversarNoWhatsApp(item)}
              onAbrirPerfil={() => router.push({
                pathname: "/profile",
                params: { id: String(item.prestadorId), modo: "candidatura" },
              })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialIcons name="groups" size={43} color={Colors.primary} />
              <Text style={styles.centerTitle}>Nenhum candidato ainda</Text>
              <Text style={styles.centerText}>Quando um prestador se candidatar, a proposta aparecerá aqui.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={candidatoParaSelecionar !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCandidatoParaSelecionar(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} accessibilityViewIsModal>
            <View style={styles.modalIcon}>
              <MaterialIcons name="how-to-reg" size={31} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Selecionar prestador</Text>
            <Text style={styles.modalText}>
              {candidatoParaSelecionar
                ? `Deseja escolher ${candidatoParaSelecionar.nomePrestador} por ${formatarValor(candidatoParaSelecionar.valor)}? As demais candidaturas serão encerradas.`
                : ""}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCandidatoParaSelecionar(null)}
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => candidatoParaSelecionar && void selecionar(candidatoParaSelecionar)}
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>Selecionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 17, paddingBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 45, height: 45, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { color: Colors.white, fontSize: 21, fontWeight: "800" },
  headerSubtitle: { color: Colors.primaryLight, fontSize: 12, lineHeight: 17, marginTop: 3 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 12 },
  centerTitle: { color: Colors.ink, fontSize: 18, fontWeight: "700", textAlign: "center" },
  centerText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: "center" },
  retryButton: { backgroundColor: Colors.primary, borderRadius: 13, paddingHorizontal: 21, paddingVertical: 13 },
  retryText: { color: Colors.white, fontWeight: "800" },
  content: { padding: 17, paddingBottom: 40, width: "100%", maxWidth: 760, alignSelf: "center" },
  emptyContent: { flexGrow: 1 },
  summary: { gap: 6, marginBottom: 15 },
  summaryTitle: { color: Colors.ink, fontSize: 18, fontWeight: "700" },
  summaryText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  errorText: { color: Colors.error, fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 17, marginBottom: 14, gap: 14, borderWidth: 1, borderColor: Colors.border },
  profileArea: { gap: 14 },
  selectedCard: { borderColor: Colors.success, borderWidth: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  professionalInfo: { flex: 1, minWidth: 0 },
  professionalName: { color: Colors.ink, fontSize: 16, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { color: Colors.textSecondary, fontSize: 11 },
  statusBadge: { maxWidth: "38%", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, fontSize: 10, fontWeight: "800", overflow: "hidden" },
  offerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 13, borderRadius: 14, backgroundColor: "#EFF6FF" },
  label: { color: Colors.textSecondary, fontSize: 11 },
  value: { color: Colors.primary, fontSize: 19, fontWeight: "800", marginTop: 2 },
  message: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  selectButton: { minHeight: 50, borderRadius: 14, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  selectButtonText: { color: Colors.white, fontSize: 14, fontWeight: "800" },
  whatsappButton: { minHeight: 50, borderRadius: 14, backgroundColor: Colors.success, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  whatsappButtonText: { color: Colors.white, fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.65 },
  emptyCard: { flex: 1, minHeight: 260, backgroundColor: Colors.white, borderRadius: 20, padding: 26, alignItems: "center", justifyContent: "center", gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.55)", alignItems: "center", justifyContent: "center", padding: 22 },
  modalCard: { width: "100%", maxWidth: 430, borderRadius: 22, backgroundColor: Colors.white, padding: 22, alignItems: "center" },
  modalIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  modalTitle: { color: Colors.ink, fontSize: 20, fontWeight: "700", textAlign: "center" },
  modalText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 9 },
  modalActions: { width: "100%", flexDirection: "row", gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, minHeight: 49, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  cancelButtonText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "700" },
  confirmButton: { flex: 1, minHeight: 49, borderRadius: 14, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  confirmButtonText: { color: Colors.white, fontSize: 14, fontWeight: "800" },
});
