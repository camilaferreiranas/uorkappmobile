import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { ReviewCard } from "../../components/ui/review-card";
import { Chip, ChipRow } from "../../components/ui/chip";
import { ListCard } from "../../components/ui/list-card";
import { SectionHeader } from "../../components/ui/section-header";
import { Colors, Radii, Shadow, Spacing } from "../../constants/theme";

const lastReview = {
  name: "Mariana Costa",
  comment: "Serviço impecável, pontual e muito atencioso.",
  rating: 5.0,
  date: "2 dias atrás",
};

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


export default function ProfessionalHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.hello}>Olá, {user?.nome ?? "profissional"}</Text>
            <View style={styles.statusRow}>
              <MaterialIcons name="circle" size={9} color={Colors.success} />
              <Text style={styles.status}>Disponível para novas demandas</Text>
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
              <Chip key={f} label={f} active={i === 0} />
            ))}
          </ChipRow>
        </View>

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
              title={d.title}
              subtitle={d.subtitle}
              subtitleIcon="place"
              price={d.price}
              icon={d.icon}
              onPress={() => router.push({ pathname: "/demand-details", params: { id: d.id, title: d.title, subtitle: d.subtitle, budget: d.budget, urgency: d.urgency, distance: d.distance, client: d.client, description: d.description } })}
            />
          </View>
        ))}
        <SectionHeader title="Última avaliação" />
        <ReviewCard name={lastReview.name} comment={lastReview.comment} rating={lastReview.rating} distance={lastReview.date} />
      </ScrollView>

      <ProfessionalNavBar active="inicio" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
  },
  container: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.section,
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  hello: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandDark,
    marginBottom: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  status: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  switch: {
    flexDirection: "row",
    alignItems: "center",
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
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.lg,
    paddingVertical: 16,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
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
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
  },
  urgentTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    backgroundColor: Colors.warningSurface,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
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
    fontSize: 13,
  },
});
