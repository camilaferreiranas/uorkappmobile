import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SectionHeader } from "../../components/ui/section-header";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { useAuth } from "../../contexts/auth-context";
import { useNotifications } from "../../contexts/notification-context";
import {
  atualizarLocalizacaoPrestador,
  verificarCadastroPrestador,
} from "../../services/prestadorService";

const metrics = [
  { label: "Novos pedidos", value: "12", note: "Hoje", icon: "inbox", color: "#0D3D8B", bg: "#E8EDFA" },
  { label: "Em andamento", value: "8", note: "Ativos", icon: "pending-actions", color: "#D86A3F", bg: "#FFF0EB" },
  { label: "Faturamento", value: "R$2.4k", note: "Últ. 30 dias", icon: "account-balance-wallet", color: "#2E7D32", bg: "#EAFAF1" },
];

const nearbyDemands = [
  {
    id: "1",
    title: "Instalação elétrica",
    subtitle: "Apartamento, 3 pontos",
    budget: "R$ 340",
    urgency: "Urgente",
    distance: "1,8 km",
    client: "João Melo",
    description: "Preciso instalar 3 novos pontos elétricos no apartamento. Sala e dois quartos.",
  },
  {
    id: "2",
    title: "Troca de torneira",
    subtitle: "Cozinha residencial",
    budget: "R$ 120",
    urgency: "Normal",
    distance: "2,3 km",
    client: "Ana Lima",
    description: "Torneira da cozinha com vazamento. Precisa de troca completa com peça.",
  },
  {
    id: "3",
    title: "Limpeza pós-obra",
    subtitle: "Casa térrea",
    budget: "R$ 420",
    urgency: "Hoje",
    distance: "3,1 km",
    client: "Pedro Santos",
    description: "Casa após reforma. Limpeza pesada em todos os cômodos, aproximadamente 120m².",
  },
];

const lastReview = {
  name: "Mariana Costa",
  comment: "Serviço impecável, pontual e muito atencioso.",
  rating: 5.0,
  date: "2 dias atrás",
};

const urgencyStyle: Record<string, { bg: string; text: string }> = {
  Urgente: { bg: "#FFF0EB", text: "#D86A3F" },
  Normal:  { bg: "#EAFAF1", text: "#2E7D32" },
  Hoje:    { bg: "#FFEBEE", text: "#C62828" },
};

export default function ProfessionalHomeScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D3D8B" />
          <Text style={styles.loadingText}>Verificando cadastro profissional...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cadastroStatus === "cliente") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.nonProfessionalContainer}>
          <View style={styles.header}>
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
              <MaterialIcons name="work-outline" size={36} color="#0D3D8B" />
            </View>
            <Text style={styles.professionalInviteTitle}>Torne-se um profissional</Text>
            <TouchableOpacity
              style={styles.professionalInviteButton}
              onPress={() =>
                Alert.alert(
                  "Cadastro profissional",
                  "O formulário de cadastro profissional será aberto nesta opção."
                )
              }
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error-outline" size={42} color="#B3261E" />
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
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
              <MaterialIcons name="notifications-none" size={23} color="#D1E0FF" />
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
              <MaterialIcons name="notifications-active" size={22} color="#0D3D8B" />
            </View>
            <View style={styles.notificationCardContent}>
              <Text style={styles.notificationCardTitle}>{ultimaNotificacao.titulo}</Text>
              <Text style={styles.notificationCardMessage} numberOfLines={2}>
                {ultimaNotificacao.mensagem}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#0D3D8B" />
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
            color={localizacaoStatus === "erro" ? "#B3261E" : "#0D3D8B"}
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

        {/* ── Demandas próximas ── */}
        <SectionHeader
          title="Demandas próximas"
          subtitle={`${nearbyDemands.length} novas`}
          style={styles.sectionHeader}
        />

        {nearbyDemands.map((demand) => {
          const us = urgencyStyle[demand.urgency] ?? urgencyStyle.Normal;
          return (
            <TouchableOpacity
              key={demand.id}
              style={styles.demandCard}
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: "/demand-details" as any,
                  params: {
                    id: demand.id,
                    title: demand.title,
                    subtitle: demand.subtitle,
                    budget: demand.budget,
                    urgency: demand.urgency,
                    distance: demand.distance,
                    client: demand.client,
                    description: demand.description,
                  },
                })
              }
            >
              {/* linha superior */}
              <View style={styles.demandTop}>
                <Text style={styles.demandTitle} numberOfLines={1}>
                  {demand.title}
                </Text>
                <Text style={styles.demandBudget}>{demand.budget}</Text>
              </View>

              {/* subtítulo */}
              <Text style={styles.demandSubtitle} numberOfLines={1}>
                {demand.subtitle}
              </Text>

              {/* linha inferior */}
              <View style={styles.demandBottom}>
                <View style={[styles.urgencyTag, { backgroundColor: us.bg }]}>
                  <Text style={[styles.urgencyText, { color: us.text }]}>
                    {demand.urgency}
                  </Text>
                </View>
                <View style={styles.distanceRow}>
                  <MaterialIcons name="location-on" size={12} color="#8A8A8A" />
                  <Text style={styles.demandDistance}>{demand.distance}</Text>
                </View>
                <View style={styles.demandArrow}>
                  <MaterialIcons name="arrow-forward-ios" size={12} color="#0D3D8B" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

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
              <MaterialIcons name="star" size={14} color="#227D41" />
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
    backgroundColor: "#F2F4FB",
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
    color: "#7A7A95",
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
    backgroundColor: "#fff",
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
    backgroundColor: "#E8EDFA",
    marginBottom: 18,
  },
  professionalInviteTitle: {
    color: "#111",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 22,
  },
  professionalInviteButton: {
    width: "100%",
    backgroundColor: "#0D3D8B",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  professionalInviteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  statusErrorTitle: {
    color: "#B3261E",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  backToClientButton: {
    backgroundColor: "#0D3D8B",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backToClientButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Header */
  header: {
    backgroundColor: "#0D3D8B",
    paddingHorizontal: 20,
    paddingTop: 20,
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
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#B8CCF6",
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
    backgroundColor: "#4CD964",
  },
  onlineBadgeText: {
    color: "#D1E0FF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Switch */
  switchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
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
    backgroundColor: "#0D3D8B",
  },
  switchLabel: {
    color: "#7A7A95",
    fontWeight: "700",
    fontSize: 14,
  },
  switchLabelActive: {
    color: "#fff",
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
    backgroundColor: "#E75A2B",
    borderWidth: 2,
    borderColor: "#0D3D8B",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  notificationCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F4F7FF",
    borderWidth: 1,
    borderColor: "#D6E1F5",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#E2EAF9",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCardContent: {
    flex: 1,
  },
  notificationCardTitle: {
    color: "#0D3D8B",
    fontSize: 14,
    fontWeight: "800",
  },
  notificationCardMessage: {
    color: "#5E6472",
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
    backgroundColor: "#E8EDFA",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  locationStatusError: {
    backgroundColor: "#FDECEA",
  },
  locationStatusText: {
    flex: 1,
    color: "#0D3D8B",
    fontSize: 12,
    fontWeight: "600",
  },
  locationStatusTextError: {
    color: "#B3261E",
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
    backgroundColor: "#fff",
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
    color: "#111",
  },
  demandBudget: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D3D8B",
    flexShrink: 0,
  },
  demandSubtitle: {
    fontSize: 12,
    color: "#7A7A95",
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
    color: "#8A8A8A",
    fontSize: 11,
  },
  demandArrow: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#E8EDFA",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Review */
  reviewCard: {
    backgroundColor: "#E9F7EE",
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
    color: "#111",
    marginBottom: 4,
  },
  reviewAuthor: {
    color: "#505050",
    fontWeight: "600",
    fontSize: 12,
  },
  reviewBadge: {
    flexDirection: "row",
    backgroundColor: "#D6F0D8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  reviewBadgeText: {
    color: "#227D41",
    fontWeight: "700",
    fontSize: 13,
  },
  reviewComment: {
    color: "#505050",
    fontSize: 13,
    lineHeight: 19,
  },
});
