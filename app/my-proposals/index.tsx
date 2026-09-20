import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileScreenHeader } from "../../components/ui/profile-screen-header";
import { Colors } from "../../constants/theme";
import {
  buscarMinhasPropostas,
  type HistoricoCliente,
  type StatusProposta,
} from "../../services/propostaService";

const statusConfig: Record<
  StatusProposta,
  {
    label: string;
    color: string;
    background: string;
    icon: "schedule" | "handshake" | "cancel" | "block" | "check-circle";
  }
> = {
  PENDENTE: {
    label: "Aguardando resposta",
    color: Colors.warning,
    background: "#FFF7EA",
    icon: "schedule",
  },
  ACEITA: {
    label: "Aceita",
    color: Colors.primary,
    background: Colors.primaryLight,
    icon: "handshake",
  },
  RECUSADA: {
    label: "Recusada",
    color: Colors.textSecondary,
    background: Colors.background,
    icon: "cancel",
  },
  CANCELADA: {
    label: "Cancelada",
    color: Colors.error,
    background: "#FDECEA",
    icon: "block",
  },
  FINALIZADA: {
    label: "Concluída",
    color: Colors.success,
    background: "#EAF7ED",
    icon: "check-circle",
  },
};

function formatarData(data: string) {
  const date = new Date(data);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatarUrgencia(urgencia: HistoricoCliente["urgencia"]) {
  if (urgencia === "URGENTE") return "Urgente";
  if (urgencia === "HOJE") return "Para hoje";
  return "Normal";
}

interface ProposalCardProps {
  proposta: HistoricoCliente;
  onOpenProvider: () => void;
}

function ProposalCard({ proposta, onOpenProvider }: ProposalCardProps) {
  const status = statusConfig[proposta.status];

  return (
    <View style={styles.card}>
      {proposta.fotoUrl ? (
        <Image
          source={{ uri: proposta.fotoUrl }}
          style={styles.photo}
          contentFit="cover"
          transition={180}
          cachePolicy="disk"
          accessibilityLabel={`Foto da proposta ${proposta.titulo}`}
        />
      ) : null}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {proposta.titulo}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <MaterialIcons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.providerRow}
          onPress={onOpenProvider}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Abrir perfil de ${proposta.nomePrestador}`}
        >
          <View style={styles.providerIcon}>
            <MaterialIcons name="person" size={18} color={Colors.primary} />
          </View>
          <View style={styles.providerContent}>
            <Text style={styles.metaLabel}>Profissional</Text>
            <Text style={styles.providerName} numberOfLines={1}>
              {proposta.nomePrestador}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={21} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.description} numberOfLines={4}>
          {proposta.descricao}
        </Text>

        {proposta.localizacao ? (
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={18} color={Colors.primary} />
            <Text style={styles.locationText} numberOfLines={2}>
              {proposta.localizacao}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.urgencyBadge}>
            <MaterialIcons name="schedule" size={15} color={Colors.warning} />
            <Text style={styles.urgencyText}>{formatarUrgencia(proposta.urgencia)}</Text>
          </View>
          <View style={styles.dateRow}>
            <MaterialIcons name="event" size={15} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{formatarData(proposta.dataCriacao)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function MyProposalsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 700;
  const [propostas, setPropostas] = useState<HistoricoCliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (exibirCarregamento = true) => {
    if (exibirCarregamento) setCarregando(true);
    setErro("");
    try {
      setPropostas(await buscarMinhasPropostas());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar suas propostas."
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

  const resumo = useMemo(() => {
    const aguardando = propostas.filter((item) => item.status === "PENDENTE").length;
    const aceitas = propostas.filter((item) => item.status === "ACEITA").length;
    return { total: propostas.length, aguardando, aceitas };
  }, [propostas]);

  function atualizar() {
    setAtualizando(true);
    void carregar(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader
        title="Minhas propostas"
        subtitle="Acompanhe as solicitações enviadas aos profissionais"
      />

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Carregando suas propostas...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <MaterialIcons name="error-outline" size={42} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void carregar()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar as propostas novamente"
          >
            <MaterialIcons name="refresh" size={19} color={Colors.white} />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={propostas}
          keyExtractor={(item) => String(item.propostaId)}
          renderItem={({ item }) => (
            <ProposalCard
              proposta={item}
              onOpenProvider={() =>
                router.push({
                  pathname: "/profile",
                  params: { id: String(item.prestadorId), modo: "candidatura" },
                })
              }
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            wide && styles.listContentWide,
            propostas.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizar}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            propostas.length > 0 ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{resumo.total}</Text>
                  <Text style={styles.summaryLabel}>Enviadas</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{resumo.aguardando}</Text>
                  <Text style={styles.summaryLabel}>Aguardando</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{resumo.aceitas}</Text>
                  <Text style={styles.summaryLabel}>Aceitas</Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="send" size={38} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Você ainda não enviou propostas</Text>
              <Text style={styles.emptyText}>
                Acesse o perfil de um profissional e envie os detalhes do serviço que precisa.
              </Text>
            </View>
          }
        />
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
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEA",
  },
  stateText: { color: Colors.textSecondary, fontSize: 14 },
  errorTitle: { color: Colors.ink, fontSize: 19, fontWeight: "700" },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center", lineHeight: 20 },
  retryButton: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    borderRadius: 13,
    paddingHorizontal: 19,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  retryText: { color: Colors.white, fontWeight: "800" },
  listContent: { padding: 16, paddingBottom: 44 },
  listContentWide: { width: "100%", maxWidth: 760, alignSelf: "center" },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  summaryLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 2 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },
  photo: { width: "100%", height: 170, backgroundColor: Colors.background },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { flex: 1, color: Colors.ink, fontSize: 17, fontWeight: "700", lineHeight: 22 },
  statusBadge: {
    maxWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: { flexShrink: 1, fontSize: 10, fontWeight: "800" },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: Colors.background,
    borderRadius: 13,
    padding: 10,
  },
  providerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  providerContent: { flex: 1, marginLeft: 10 },
  metaLabel: { color: Colors.textSecondary, fontSize: 10 },
  providerName: { color: Colors.ink, fontSize: 13, fontWeight: "700", marginTop: 1 },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 14 },
  locationRow: { flexDirection: "row", alignItems: "flex-start", gap: 7, marginTop: 13 },
  locationText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF7EA",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  urgencyText: { color: Colors.warning, fontSize: 10, fontWeight: "700" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  dateText: { color: Colors.textSecondary, fontSize: 10 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 30,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { color: Colors.ink, fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7 },
});
