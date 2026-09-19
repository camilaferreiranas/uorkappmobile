import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { DemandasDisponiveisPreview } from "../../components/ui/demandas-disponiveis";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../contexts/auth-context";
import { useNotifications } from "../../contexts/notification-context";
import {
  atualizarLocalizacaoPrestador,
  verificarCadastroPrestador,
} from "../../services/prestadorService";

const metrics = [
  { label: "Novos pedidos", value: "12", note: "Hoje", icon: "inbox", color: Colors.primary, bg: Colors.primaryLight },
  { label: "Em andamento", value: "8", note: "Ativos", icon: "pending-actions", color: Colors.warning, bg: "#FFF7EA" },
  { label: "Faturamento", value: "R$2.4k", note: "Últ. 30 dias", icon: "account-balance-wallet", color: Colors.success, bg: "#EAF7ED" },
];

const lastReview = {
  name: "Mariana Costa",
  comment: "Serviço impecável, pontual e muito atencioso.",
  rating: 5.0,
  date: "2 dias atrás",
};

export default function ProfessionalHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    notificacoesPrestador,
    naoLidasPrestador,
    sincronizarPrestador,
  } = useNotifications();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const [localizacaoStatus, setLocalizacaoStatus] = useState<
    "carregando" | "atualizada" | "erro"
  >("carregando");
  const [localizacaoMensagem, setLocalizacaoMensagem] = useState(
    "Atualizando localização..."
  );
  const [cadastroStatus, setCadastroStatus] = useState<
    "carregando" | "prestador" | "cliente" | "erro"
  >("carregando");
  const ultimaNotificacao =
    notificacoesPrestador.find((notificacao) => !notificacao.lida) ?? null;

  useEffect(() => {
    let active = true;

    async function carregarModoProfissional() {
      try {
        const cadastrado = await verificarCadastroPrestador();
        if (!active) return;

        if (!cadastrado) {
          setCadastroStatus("cliente");
          return;
        }

        setCadastroStatus("prestador");

        try {
        await atualizarLocalizacaoPrestador();
        if (!active) return;

        setLocalizacaoStatus("atualizada");
        setLocalizacaoMensagem("Localização profissional atualizada");
        } catch (error) {
          if (!active) return;

          setLocalizacaoStatus("erro");
          setLocalizacaoMensagem(
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar a localização."
          );
        }
      } catch {
        if (!active) return;
        setCadastroStatus("erro");
      }
    }

    void carregarModoProfissional();

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (cadastroStatus === "prestador") void sincronizarPrestador();
    }, [cadastroStatus, sincronizarPrestador])
  );

  if (cadastroStatus === "carregando") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Verificando cadastro profissional...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cadastroStatus === "cliente") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <ScrollView contentContainerStyle={styles.nonProfessionalContainer}>
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, isSmall && { fontSize: 18 }]}>
                Olá, {user?.nome ?? "usuário"} 👋
              </Text>
              <Text style={styles.headerSubtitle}>
                Comece a oferecer seus serviços
              </Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Text style={styles.switchLabel}>Cliente</Text>
            </TouchableOpacity>
            <View style={[styles.switchButton, styles.switchButtonActive]}>
              <Text style={[styles.switchLabel, styles.switchLabelActive]}>
                Profissional
              </Text>
            </View>
          </View>

          <View style={styles.professionalInvite}>
            <View style={styles.professionalInviteIcon}>
              <MaterialIcons name="work-outline" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.professionalInviteTitle}>Torne-se um profissional</Text>
            <TouchableOpacity
              style={styles.professionalInviteButton}
              onPress={() => router.push("/professional-registration" as Href)}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.professionalInviteButtonText}>
                Cadastro profissional
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (cadastroStatus === "erro") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error-outline" size={42} color={Colors.error} />
          <Text style={styles.statusErrorTitle}>Não foi possível verificar seu cadastro</Text>
          <TouchableOpacity
            style={styles.backToClientButton}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.backToClientButtonText}>Voltar para cliente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, isSmall && { fontSize: 18 }]}>
              Olá, {user?.nome ?? "profissional"} 👋
            </Text>
            <Text style={styles.headerSubtitle}>Disponível para novos serviços</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/professional-notifications" as Href)}
              accessibilityRole="button"
              accessibilityLabel={`Notificações: ${naoLidasPrestador} não lidas`}
            >
              <MaterialIcons name="notifications-none" size={23} color={Colors.primaryLight} />
              {naoLidasPrestador > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {naoLidasPrestador > 99 ? "99+" : naoLidasPrestador}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineBadgeText}>Online</Text>
            </View>
          </View>
        </View>

        {/* ── Toggle Cliente/Profissional ── */}
        {ultimaNotificacao ? (
          <TouchableOpacity
            style={styles.notificationCard}
            onPress={() => router.push("/professional-notifications" as Href)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${ultimaNotificacao.titulo}. ${ultimaNotificacao.mensagem}`}
          >
            <View style={styles.notificationCardIcon}>
              <MaterialIcons name="notifications-active" size={22} color={Colors.primary} />
            </View>
            <View style={styles.notificationCardContent}>
              <Text style={styles.notificationCardTitle}>{ultimaNotificacao.titulo}</Text>
              <Text style={styles.notificationCardMessage} numberOfLines={2}>
                {ultimaNotificacao.mensagem}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : null}

        <View
          style={[
            styles.locationStatus,
            localizacaoStatus === "erro" && styles.locationStatusError,
          ]}
        >
          <MaterialIcons
            name={localizacaoStatus === "erro" ? "location-off" : "location-on"}
            size={16}
            color={localizacaoStatus === "erro" ? Colors.error : Colors.primary}
          />
          <Text
            style={[
              styles.locationStatusText,
              localizacaoStatus === "erro" && styles.locationStatusTextError,
            ]}
          >
            {localizacaoMensagem}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.switchLabel}>Cliente</Text>
          </TouchableOpacity>
          <View style={[styles.switchButton, styles.switchButtonActive]}>
            <Text style={[styles.switchLabel, styles.switchLabelActive]}>
              Profissional
            </Text>
          </View>
        </View>

        {/* ── Métricas ── */}
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <View key={m.label} style={[styles.metricCard, { backgroundColor: m.bg }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: m.color + "22" }]}>
                <MaterialIcons name={m.icon as any} size={20} color={m.color} />
              </View>
              <Text
                style={[styles.metricValue, { color: m.color }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {m.value}
              </Text>
              <Text style={styles.metricLabel} numberOfLines={2}>{m.label}</Text>
              <Text style={styles.metricNote}>{m.note}</Text>
            </View>
          ))}
        </View>

        <DemandasDisponiveisPreview />

        {/* ── Última avaliação ── */}
        <View style={styles.reviewCard}>
          <View style={styles.reviewTop}>
            <View>
              <Text style={styles.reviewTitle}>Última avaliação</Text>
              <Text style={styles.reviewAuthor}>
                {lastReview.name} · {lastReview.date}
              </Text>
            </View>
            <View style={styles.reviewBadge}>
              <MaterialIcons name="star" size={14} color={Colors.success} />
              <Text style={styles.reviewBadgeText}>
                {lastReview.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.reviewComment}>{lastReview.comment}</Text>
        </View>
      </ScrollView>

      <ProfessionalNavBar active="inicio" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 14,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  nonProfessionalContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  professionalInvite: {
    flex: 1,
    minHeight: 330,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  professionalInviteIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    marginBottom: 18,
  },
  professionalInviteTitle: {
    color: Colors.ink,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 22,
  },
  professionalInviteButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  professionalInviteButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  statusErrorTitle: {
    color: Colors.error,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  backToClientButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backToClientButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

  /* Header */
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.primaryLight,
    fontSize: 13,
    lineHeight: 18,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    alignSelf: "flex-start",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineBadgeText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: "700",
  },

  /* Switch */
  switchRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  switchButtonActive: {
    backgroundColor: Colors.primary,
  },
  switchLabel: {
    color: Colors.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
  switchLabelActive: {
    color: Colors.white,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -3,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "800",
  },
  notificationCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCardContent: {
    flex: 1,
  },
  notificationCardTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  notificationCardMessage: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  locationStatus: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  locationStatusError: {
    backgroundColor: "#FDECEA",
  },
  locationStatusText: {
    flex: 1,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  locationStatusTextError: {
    color: Colors.error,
  },

  /* Metrics */
  metricsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
    minWidth: 0,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 0,
  },
  metricLabel: {
    fontSize: 10,
    color: "#555",
    lineHeight: 13,
    fontWeight: "600",
  },
  metricNote: {
    fontSize: 9,
    color: "#888",
    fontWeight: "500",
    marginTop: 1,
  },

  /* Section header */
  sectionHeader: {
    marginTop: 24,
    marginBottom: 4,
  },

  /* Demand cards */
  demandCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  demandTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  demandTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.ink,
  },
  demandBudget: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
    flexShrink: 0,
  },
  demandSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  demandBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urgencyTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  urgencyText: {
    fontWeight: "700",
    fontSize: 11,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  demandDistance: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  demandArrow: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Review */
  reviewCard: {
    backgroundColor: "#EAF7ED",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.ink,
    marginBottom: 4,
  },
  reviewAuthor: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  reviewBadge: {
    flexDirection: "row",
    backgroundColor: "#EAF7ED",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  reviewBadgeText: {
    color: Colors.success,
    fontWeight: "700",
    fontSize: 13,
  },
  reviewComment: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
