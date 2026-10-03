import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";

const summary = {
  totalReceived: "R$ 8.240",
  monthReceived: "R$ 2.400",
  totalDemands: 24,
  completedDemands: 21,
  inProgressDemands: 3,
  avgRating: 4.9,
  totalRatings: 120,
};

const monthlyData = [
  { month: "Nov", value: "R$ 1.8k", demands: 8 },
  { month: "Dez", value: "R$ 2.1k", demands: 9 },
  { month: "Jan", value: "R$ 2.4k", demands: 10 },
];

const recentTransactions = [
  { id: "t1", service: "Instalação elétrica", client: "João Melo", date: "22/01/2026", value: "R$ 340", status: "recebido" },
  { id: "t2", service: "Troca de lâmpadas", client: "Ana Lima", date: "20/01/2026", value: "R$ 90", status: "recebido" },
  { id: "t3", service: "Laudo técnico", client: "Fernanda Costa", date: "18/01/2026", value: "R$ 250", status: "recebido" },
  { id: "t4", service: "Reparo de tomadas", client: "Luciana Barros", date: "15/01/2026", value: "R$ 200", status: "recebido" },
  { id: "t5", service: "Instalação de AR", client: "Carlos Ramos", date: "10/01/2026", value: "R$ 600", status: "pendente" },
];

export default function ProfessionalReportScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatório</Text>
        <Text style={styles.headerSubtitle}>Resumo financeiro e de demandas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total recebido</Text>
          <Text style={styles.balanceValue}>{summary.totalReceived}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceSub}>
              <MaterialIcons name="trending-up" size={16} color="#2E7D32" />
              <Text style={styles.balanceSubText}>Mês atual: {summary.monthReceived}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="assignment-turned-in" size={24} color="#0D3D8B" />
            <Text style={styles.statValue}>{summary.completedDemands}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="pending-actions" size={24} color="#D86A3F" />
            <Text style={styles.statValue}>{summary.inProgressDemands}</Text>
            <Text style={styles.statLabel}>Em andamento</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="star" size={24} color="#FFB800" />
            <Text style={styles.statValue}>{summary.avgRating}</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Evolução mensal</Text>
        </View>

        <View style={styles.monthlyCard}>
          {monthlyData.map((m, index) => (
            <View key={m.month} style={[styles.monthRow, index < monthlyData.length - 1 && styles.monthRowBorder]}>
              <Text style={styles.monthName}>{m.month}</Text>
              <View style={styles.monthBar}>
                <View style={[styles.monthBarFill, { width: `${(index + 1) * 30}%` }]} />
              </View>
              <Text style={styles.monthDemands}>{m.demands} demandas</Text>
              <Text style={styles.monthValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transações recentes</Text>
        </View>

        <View style={styles.transactionsCard}>
          {recentTransactions.map((t, index) => (
            <View key={t.id} style={[styles.transactionRow, index < recentTransactions.length - 1 && styles.transactionBorder]}>
              <View style={styles.transactionIcon}>
                <MaterialIcons
                  name="flash-on"
                  size={18}
                  color="#0D3D8B"
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionService}>{t.service}</Text>
                <Text style={styles.transactionClient}>{t.client} · {t.date}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionValue}>{t.value}</Text>
                <View style={[styles.transactionStatus, t.status === "pendente" && styles.transactionStatusPending]}>
                  <Text style={[styles.transactionStatusText, t.status === "pendente" && styles.transactionStatusTextPending]}>
                    {t.status === "recebido" ? "Recebido" : "Pendente"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ProfessionalNavBar active="relatorio" />
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
  balanceCard: {
    backgroundColor: "#0D3D8B",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    alignItems: "center",
  },
  balanceLabel: {
    color: "#B8CCF6",
    fontSize: 13,
    marginBottom: 6,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: "row",
  },
  balanceSub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceSubText: {
    color: "#D1E0FF",
    fontSize: 13,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  statLabel: {
    fontSize: 11,
    color: "#8A8A8A",
    textAlign: "center",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  monthlyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  monthRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  monthName: {
    width: 30,
    fontSize: 13,
    fontWeight: "700",
    color: "#8A8A8A",
  },
  monthBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  monthBarFill: {
    height: "100%",
    backgroundColor: "#0D3D8B",
    borderRadius: 4,
  },
  monthDemands: {
    fontSize: 11,
    color: "#8A8A8A",
    width: 70,
    textAlign: "right",
  },
  monthValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
    width: 50,
    textAlign: "right",
  },
  transactionsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E8EDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionService: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 3,
  },
  transactionClient: {
    fontSize: 11,
    color: "#8A8A8A",
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  transactionStatus: {
    backgroundColor: "#EAFAF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  transactionStatusPending: {
    backgroundColor: "#FFF5E6",
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E7D32",
  },
  transactionStatusTextPending: {
    color: "#D86A3F",
  },
});
