import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { type Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
  buscarMinhasDemandas,
  type DemandaPublicada,
  type UrgenciaDemanda,
} from "../../services/demandaService";

type StatusDemanda = DemandaPublicada["status"];

const statusConfig: Record<
  StatusDemanda,
  { label: string; color: string; background: string; icon: "campaign" | "handshake" | "check-circle" | "cancel" }
> = {
  ABERTA: {
    label: "Aberta",
    color: Colors.warning,
    background: "#FFF7EA",
    icon: "campaign",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    color: Colors.primary,
    background: Colors.primaryLight,
    icon: "handshake",
  },
  CONCLUIDA: {
    label: "Concluída",
    color: Colors.success,
    background: "#EAF7ED",
    icon: "check-circle",
  },
  CANCELADA: {
    label: "Cancelada",
    color: Colors.error,
    background: "#FDECEA",
    icon: "cancel",
  },
};

const urgenciaConfig: Record<
  UrgenciaDemanda,
  { label: string; color: string; background: string }
> = {
  NORMAL: { label: "Normal", color: Colors.success, background: "#EAF7ED" },
  URGENTE: { label: "Urgente", color: Colors.warning, background: "#FFF7EA" },
  HOJE: { label: "Para hoje", color: Colors.error, background: "#FDECEA" },
};

function formatarValor(valor: number | null) {
  if (valor == null) return "A combinar";

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

interface DemandCardProps {
  demanda: DemandaPublicada;
  onPress: () => void;
}

function DemandCard({ demanda, onPress }: DemandCardProps) {
  const status = statusConfig[demanda.status];
  const urgencia = urgenciaConfig[demanda.urgencia];
  const primeiraFoto = demanda.fotos?.[0]?.url;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Ver candidaturas da demanda ${demanda.titulo}`}
    >
      {primeiraFoto ? (
        <Image
          source={{ uri: primeiraFoto }}
          style={styles.cardImage}
          contentFit="cover"
          transition={180}
          cachePolicy="disk"
          accessibilityLabel={`Foto da demanda ${demanda.titulo}`}
        />
      ) : null}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContent}>
            <Text style={styles.category} numberOfLines={1}>
              {demanda.categoria}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {demanda.titulo}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <MaterialIcons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {demanda.descricao}
        </Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={18} color={Colors.primary} />
          <Text style={styles.infoText} numberOfLines={2}>
            {demanda.localizacao}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.budgetContent}>
            <Text style={styles.metaLabel}>Orçamento</Text>
            <Text style={styles.budget}>{formatarValor(demanda.orcamento)}</Text>
          </View>

          <View style={[styles.urgencyBadge, { backgroundColor: urgencia.background }]}>
            <MaterialIcons name="schedule" size={14} color={urgencia.color} />
            <Text style={[styles.urgencyText, { color: urgencia.color }]}>
              {urgencia.label}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>Publicada em {formatarData(demanda.criadoEm)}</Text>
        </View>
        <View style={styles.candidatesRow}>
          <MaterialIcons name="groups" size={19} color={Colors.primary} />
          <Text style={styles.candidatesText}>Ver prestadores candidatos</Text>
          <MaterialIcons name="chevron-right" size={21} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyDemandsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 700;
  const [demandas, setDemandas] = useState<DemandaPublicada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (exibirCarregamento = true) => {
    if (exibirCarregamento) setCarregando(true);
    setErro("");

    try {
      setDemandas(await buscarMinhasDemandas());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar suas demandas."
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
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader
        title="Minhas demandas"
        subtitle="Acompanhe tudo o que você publicou"
      />

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Carregando suas demandas...</Text>
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
            accessibilityLabel="Tentar carregar as demandas novamente"
          >
            <MaterialIcons name="refresh" size={19} color={Colors.white} />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={demandas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <DemandCard
              demanda={item}
              onPress={() => router.push(`/demand-candidates?id=${item.id}` as Href)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            wide && styles.listContentWide,
            demandas.length === 0 && styles.emptyListContent,
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
            demandas.length > 0 ? (
              <Text style={styles.resultCount}>
                {demandas.length === 1
                  ? "1 demanda publicada"
                  : `${demandas.length} demandas publicadas`}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="assignment" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Você ainda não publicou demandas</Text>
              <Text style={styles.emptyText}>
                Publique o serviço que precisa e encontre profissionais disponíveis.
              </Text>
              <TouchableOpacity
                style={styles.publishButton}
                onPress={() => router.push("/(tabs)/publicar")}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Publicar uma nova demanda"
              >
                <MaterialIcons name="add-circle-outline" size={20} color={Colors.white} />
                <Text style={styles.publishButtonText}>Publicar demanda</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 30,
    gap: 11,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FDECEA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stateText: { color: Colors.textSecondary, fontSize: 14 },
  errorTitle: { color: Colors.ink, fontSize: 18, fontWeight: "700" },
  errorText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: "center" },
  retryButton: {
    minHeight: 46,
    marginTop: 5,
    paddingHorizontal: 19,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  retryText: { color: Colors.white, fontSize: 13, fontWeight: "700" },
  listContent: { padding: 18, paddingBottom: 42 },
  listContentWide: { width: "100%", maxWidth: 760, alignSelf: "center" },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  resultCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 13,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardImage: { width: "100%", height: 176, backgroundColor: Colors.background },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  titleContent: { flex: 1, minWidth: 0 },
  category: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: { color: Colors.ink, fontSize: 18, lineHeight: 23, fontWeight: "700" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    maxWidth: "45%",
  },
  statusText: { fontSize: 10, fontWeight: "800", flexShrink: 1 },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 14,
    paddingTop: 13,
  },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 15,
  },
  budgetContent: { flex: 1 },
  metaLabel: { color: Colors.textSecondary, fontSize: 10, marginBottom: 2 },
  budget: { color: Colors.primary, fontSize: 17, fontWeight: "800" },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  urgencyText: { fontSize: 10, fontWeight: "800" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 13 },
  dateText: { color: Colors.textSecondary, fontSize: 11 },
  candidatesRow: { flexDirection: "row", alignItems: "center", gap: 7, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 13, paddingTop: 13 },
  candidatesText: { flex: 1, color: Colors.primary, fontSize: 13, fontWeight: "800" },
  emptyCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingHorizontal: 26,
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { color: Colors.ink, fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },
  publishButton: {
    minHeight: 48,
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  publishButtonText: { color: Colors.white, fontSize: 13, fontWeight: "700" },
});
