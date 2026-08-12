import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { atualizarLocalizacaoPrestador } from "../../services/prestadorService";

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
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const [localizacaoStatus, setLocalizacaoStatus] = useState<
    "carregando" | "atualizada" | "erro"
  >("carregando");
  const [localizacaoMensagem, setLocalizacaoMensagem] = useState(
    "Atualizando localização..."
  );

  useEffect(() => {
    let active = true;

    async function atualizarLocalizacao() {
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
    }

    void atualizarLocalizacao();

    return () => {
      active = false;
    };
  }, []);

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
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>Online</Text>
          </View>
        </View>

        {/* ── Toggle Cliente/Profissional ── */}
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
