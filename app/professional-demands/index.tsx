import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";

const allDemands = [
  {
    id: "1",
    title: "Instalação elétrica",
    subtitle: "Apartamento, 3 pontos",
    budget: "R$ 340",
    urgency: "Urgente",
    distance: "1,8 km",
    client: "João Melo",
    description: "Preciso instalar 3 novos pontos elétricos no apartamento. Sala e dois quartos.",
    status: "new",
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
    status: "new",
  },
  {
    id: "3",
    title: "Limpeza pós-obra",
    subtitle: "Casa térrea, 120m²",
    budget: "R$ 420",
    urgency: "Hoje",
    distance: "3,1 km",
    client: "Pedro Santos",
    description: "Casa após reforma. Limpeza pesada em todos os cômodos.",
    status: "new",
  },
  {
    id: "4",
    title: "Reparo de tomadas",
    subtitle: "Escritório comercial",
    budget: "R$ 200",
    urgency: "Normal",
    distance: "4,5 km",
    client: "Luciana Barros",
    description: "3 tomadas com defeito no escritório. Precisa de troca urgente.",
    status: "accepted",
  },
  {
    id: "5",
    title: "Instalação de ar condicionado",
    subtitle: "Residência, 2 unidades",
    budget: "R$ 600",
    urgency: "Normal",
    distance: "5,2 km",
    client: "Carlos Ramos",
    description: "Instalação de 2 splits novos. Infraestrutura já existe.",
    status: "accepted",
  },
  {
    id: "6",
    title: "Revisão elétrica geral",
    subtitle: "Casa, 3 quartos",
    budget: "R$ 380",
    urgency: "Normal",
    distance: "2,8 km",
    client: "Fernanda Costa",
    description: "Revisão completa do quadro de distribuição e fiação.",
    status: "completed",
  },
];

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Nova", color: "#0D3D8B", bg: "#E8EDFA" },
  accepted: { label: "Em andamento", color: "#2E7D32", bg: "#EAFAF1" },
  completed: { label: "Concluída", color: "#6B6B6B", bg: "#F4F4F4" },
};

const urgencyColors: Record<string, string> = {
  Urgente: "#D86A3F",
  Normal: "#2E7D32",
  Hoje: "#C62828",
};

export default function ProfessionalDemandsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Todas as Demandas</Text>
        <Text style={styles.headerSubtitle}>{allDemands.length} demandas no total</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{allDemands.filter((d) => d.status === "new").length}</Text>
            <Text style={styles.summaryLabel}>Novas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{allDemands.filter((d) => d.status === "accepted").length}</Text>
            <Text style={styles.summaryLabel}>Em andamento</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{allDemands.filter((d) => d.status === "completed").length}</Text>
            <Text style={styles.summaryLabel}>Concluídas</Text>
          </View>
        </View>

        {allDemands.map((demand) => {
          const statusInfo = statusLabels[demand.status];
          const urgencyColor = urgencyColors[demand.urgency] ?? "#6B6B6B";
          return (
            <TouchableOpacity
              key={demand.id}
              style={styles.demandCard}
              onPress={() =>
                demand.status === "new"
                  ? router.push({
                      pathname: "/demand-details" as any,
                      params: demand,
                    })
                  : undefined
              }
              activeOpacity={demand.status === "new" ? 0.75 : 1}
            >
              <View style={styles.cardTop}>
                <Text style={styles.demandTitle}>{demand.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
              <Text style={styles.demandSubtitle}>{demand.subtitle}</Text>
              <View style={styles.cardBottom}>
                <View style={[styles.urgencyTag, { backgroundColor: `${urgencyColor}18` }]}>
                  <Text style={[styles.urgencyText, { color: urgencyColor }]}>{demand.urgency}</Text>
                </View>
                <Text style={styles.distanceText}>{demand.distance}</Text>
                <Text style={styles.budgetText}>{demand.budget}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ProfessionalNavBar active="demandas" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F4FB",
  },
  header: {
    backgroundColor: "#0D3D8B",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
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
  },
  container: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  summaryRow: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D3D8B",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#8A8A8A",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 4,
  },
  demandCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  demandTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  demandSubtitle: {
    fontSize: 12,
    color: "#7A7A95",
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  distanceText: {
    fontSize: 11,
    color: "#8A8A8A",
    flex: 1,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
});
