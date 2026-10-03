import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
<<<<<<< HEAD
  Pressable,
  SafeAreaView,
=======
  ActivityIndicator,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
<<<<<<< HEAD
import { useAuth } from "../../contexts/auth-context";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { ReviewCard } from "../../components/ui/review-card";
import { Chip, ChipRow } from "../../components/ui/chip";
import { ListCard } from "../../components/ui/list-card";
import { SectionHeader } from "../../components/ui/section-header";
import { ProfessionalColors as Colors, Radii, Shadow, Spacing } from "../../constants/theme";
=======
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { DemandasDisponiveisPreview } from "../../components/ui/demandas-disponiveis";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../contexts/auth-context";
import { useNotifications } from "../../contexts/notification-context";
import { buscarResumoPrestador, type ResumoPrestador } from "../../services/propostaService";
import {
  atualizarLocalizacaoPrestador,
  verificarCadastroPrestador,
} from "../../services/prestadorService";

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

const lastReview = {
  name: "Mariana Costa",
  comment: "Serviço impecável, pontual e muito atencioso.",
  rating: 5.0,
  date: "2 dias atrás",
};

<<<<<<< HEAD
const filters = ["Todas", "Urgentes", "Perto de mim", "Meu ramo"];

const demands = [
  {
    id: "1",
    budget: "R$ 340",
    urgency: "Urgente",
    distance: "1,8 km",
    client: "João Melo",
    description: "Preciso instalar 3 novos pontos elétricos no apartamento. Sala e dois quartos.",
    title: "Instalação elétrica",
    subtitle: "Apartamento · 3 pontos · 1,8 km",
    price: "Orçamento R$ 340",
    icon: "electrical-services" as const,
    urgent: true,
  },
  {
    id: "2",
    budget: "R$ 120",
    urgency: "Normal",
    distance: "2,3 km",
    client: "Ana Lima",
    description: "Torneira da cozinha com vazamento. Precisa de troca completa com peça.",
    title: "Troca de torneira",
    subtitle: "Cozinha residencial · 2,3 km",
    price: "Orçamento R$ 120",
    icon: "plumbing" as const,
    urgent: false,
  },
  {
    id: "3",
    budget: "R$ 420",
    urgency: "Hoje",
    distance: "3,1 km",
    client: "Pedro Santos",
    description: "Casa após reforma. Limpeza pesada em todos os cômodos, aproximadamente 120m².",
    title: "Limpeza pós-obra",
    subtitle: "Casa térrea · 3,1 km",
    price: "Orçamento R$ 420",
    icon: "cleaning-services" as const,
    urgent: true,
  },
  {
    id: "4",
    budget: "R$ 260",
    urgency: "Normal",
    distance: "4,0 km",
    client: "",
    description: "Pintura de um cômodo.",
    title: "Pintura de quarto",
    subtitle: "1 cômodo · 4,0 km",
    price: "Orçamento R$ 260",
    icon: "format-paint" as const,
    urgent: false,
  },
];


=======
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
export default function ProfessionalHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
<<<<<<< HEAD
=======
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
  const [resumo, setResumo] = useState<ResumoPrestador | null>(null);
  const [carregandoResumo, setCarregandoResumo] = useState(false);
  const [erroResumo, setErroResumo] = useState("");
  const resumoRequestId = useRef(0);
  const valorIndisponivel = carregandoResumo ? "…" : "—";
  const metrics = [
    { label: "Novos pedidos", value: resumo ? String(resumo.novasDemandas) : valorIndisponivel, note: "Hoje", icon: "inbox", color: "#0D3D8B", bg: "#E8EDFA" },
    { label: "Aceitas", value: resumo ? String(resumo.emAndamento) : valorIndisponivel, note: "A combinar", icon: "pending-actions", color: "#D86A3F", bg: "#FFF0EB" },
    { label: "Faturamento", value: resumo ? formatarValor(resumo.faturamentoUltimos30Dias) : valorIndisponivel, note: "Últ. 30 dias", icon: "account-balance-wallet", color: "#2E7D32", bg: "#EAFAF1", isCurrency: true },
  ];
  const ultimaNotificacao =
    notificacoesPrestador.find((notificacao) => !notificacao.lida) ?? null;

  const carregarResumo = useCallback(async () => {
    const requestId = ++resumoRequestId.current;
    setCarregandoResumo(true);
    setErroResumo("");
    try {
      const dados = await buscarResumoPrestador();
      if (requestId === resumoRequestId.current) setResumo(dados);
    } catch (error) {
      if (requestId === resumoRequestId.current) {
        setErroResumo(error instanceof Error ? error.message : "Não foi possível carregar os indicadores.");
      }
    } finally {
      if (requestId === resumoRequestId.current) setCarregandoResumo(false);
    }
  }, []);

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
      if (cadastroStatus === "prestador") {
        void sincronizarPrestador();
        void carregarResumo();
      }
      return () => {
        resumoRequestId.current += 1;
      };
    }, [cadastroStatus, carregarResumo, sincronizarPrestador])
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
<<<<<<< HEAD
        <View style={styles.topBar}>
          <View>
            <Text style={styles.profileLabel}>PERFIL PRESTADOR</Text>
            <Text style={styles.hello}>Olá, {user?.nome ?? "profissional"}</Text>
            <View style={styles.statusRow}>
              <MaterialIcons name="circle" size={9} color={Colors.success} />
              <Text style={styles.status}>Disponível para novas demandas</Text>
=======
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
              <View style={styles.metricValueSlot}>
                {m.isCurrency && resumo ? (
                  <View style={styles.revenueValue}>
                    <Text style={styles.revenueCurrency}>R$</Text>
                    <Text
                      style={[styles.revenueAmount, isSmall && styles.revenueAmountSmall]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {m.value}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[styles.metricValue, { color: m.color }]}
                    numberOfLines={1}
                  >
                    {m.value}
                  </Text>
                )}
              </View>
              <Text style={styles.metricLabel} numberOfLines={2}>{m.label}</Text>
              <Text style={styles.metricNote}>{m.note}</Text>
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
            </View>
          </View>
          <Pressable
            style={styles.switch}
            onPress={() => router.push("/home")}
            accessibilityRole="button"
          >
            <MaterialIcons name="swap-horiz" size={16} color={Colors.brandPrimary} />
            <Text style={styles.switchText}>Cliente</Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Novas hoje</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Propostas ativas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>R$ 2,4k</Text>
            <Text style={styles.statLabel}>Últimos 30 dias</Text>
          </View>
        </View>

        <View style={styles.chips}>
          <ChipRow>
            {filters.map((f, i) => (
              <Chip tone="professional" key={f} label={f} active={i === 0} />
            ))}
          </ChipRow>
        </View>
<<<<<<< HEAD

        <SectionHeader
          title="Demandas próximas"
          subtitle={`${demands.length} abertas perto de você`}
          style={styles.section}
        />

        {demands.map((d) => (
          <View key={d.title}>
            {d.urgent && (
              <View style={styles.urgentTag}>
                <MaterialIcons name="bolt" size={12} color={Colors.warningText} />
                <Text style={styles.urgentText}>Urgente</Text>
              </View>
            )}
            <ListCard
              tone="professional"
              title={d.title}
              subtitle={d.subtitle}
              subtitleIcon="place"
              price={d.price}
              icon={d.icon}
              onPress={() => router.push({ pathname: "/demand-details", params: { id: d.id, title: d.title, subtitle: d.subtitle, budget: d.budget, urgency: d.urgency, distance: d.distance, client: d.client, description: d.description } })}
            />
=======
        {erroResumo ? (
          <View style={styles.metricsError}>
            <Text style={styles.metricsErrorText}>{erroResumo}</Text>
            <TouchableOpacity onPress={() => void carregarResumo()} accessibilityRole="button">
              <Text style={styles.metricsRetryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
          </View>
        ))}
        <SectionHeader title="Última avaliação" />
        <ReviewCard tone="professional" name={lastReview.name} comment={lastReview.comment} rating={lastReview.rating} distance={lastReview.date} />
      </ScrollView>

      <ProfessionalNavBar active="inicio" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: Colors.surfaceWhite,
=======
    backgroundColor: Colors.background,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
  },
  container: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.section,
    paddingBottom: 120,
  },
<<<<<<< HEAD
  topBar: {
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileLabel: {
    color: Colors.brandPrimary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
<<<<<<< HEAD
  hello: {
=======
  headerTitle: {
    color: Colors.white,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandDark,
    marginBottom: 3,
  },
<<<<<<< HEAD
  statusRow: {
=======
  headerSubtitle: {
    color: Colors.primaryLight,
    fontSize: 13,
    lineHeight: 18,
  },
  onlineBadge: {
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
<<<<<<< HEAD
  status: {
=======
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineBadgeText: {
    color: Colors.primaryLight,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    fontSize: 12,
    color: Colors.textSecondary,
  },
  switch: {
    flexDirection: "row",
<<<<<<< HEAD
    alignItems: "center",
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    gap: 4,
    backgroundColor: Colors.brandTint,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switchText: {
    color: Colors.brandPrimary,
    fontWeight: "800",
    fontSize: 13,
  },
<<<<<<< HEAD
  stats: {
=======
  metricValueSlot: {
    minHeight: 32,
    justifyContent: "flex-end",
  },
  revenueValue: {
    minWidth: 0,
  },
  revenueCurrency: {
    color: "#2E7D32",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
  revenueAmount: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 19,
  },
  revenueAmountSmall: {
    fontSize: 14,
    lineHeight: 17,
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
  metricsError: {
    marginHorizontal: 20,
    marginTop: 10,
    gap: 4,
  },
  metricsErrorText: {
    color: "#B3261E",
    fontSize: 12,
  },
  metricsRetryText: {
    color: "#0D3D8B",
    fontSize: 12,
    fontWeight: "700",
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.brandTint,
    borderRadius: Radii.lg,
    paddingVertical: 16,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
<<<<<<< HEAD
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    alignItems: "center",
  },
<<<<<<< HEAD
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  chips: {
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
  },
  urgentTag: {
    flexDirection: "row",
<<<<<<< HEAD
=======
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
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    backgroundColor: Colors.warningSurface,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
<<<<<<< HEAD
  urgentText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.warningText,
  },
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    ...Shadow.floating,
  },
  tabItem: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.brandPrimary,
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActiveLabel: {
    color: Colors.textOnBrand,
    fontWeight: "800",
=======
  reviewBadgeText: {
    color: Colors.success,
    fontWeight: "700",
    fontSize: 13,
  },
  reviewComment: {
    color: Colors.textSecondary,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
    fontSize: 13,
  },
});
