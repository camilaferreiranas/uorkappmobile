import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { useNotifications } from "../../contexts/notification-context";
import { aceitarProposta } from "../../services/propostaService";

const urgencyColors: Record<string, { bg: string; text: string }> = {
  Urgente: { bg: "#FFF0EB", text: "#D86A3F" },
  Normal: { bg: "#EAFAF1", text: "#2E7D32" },
  Hoje: { bg: "#FFEBEE", text: "#C62828" },
};

export default function DemandDetailsScreen() {
  const router = useRouter();
  const { sincronizarPrestador } = useNotifications();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    subtitle: string;
    budget: string;
    urgency: string;
    distance: string;
    client: string;
    description: string;
  }>();

  const [status, setStatus] = useState<"pending" | "accepted" | "refused">("pending");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  const urgency = params.urgency ?? "Normal";
  const colors = urgencyColors[urgency] ?? urgencyColors["Normal"];

  const handleAccept = async () => {
    const propostaId = Number(params.id);
    if (!Number.isInteger(propostaId) || propostaId <= 0) {
      setErro("Não foi possível identificar esta proposta.");
      return;
    }

    setProcessando(true);
    setErro("");
    try {
      await aceitarProposta(propostaId);
      setStatus("accepted");
      void sincronizarPrestador();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível aceitar a proposta.");
    } finally {
      setProcessando(false);
    }
  };
  const handleRefuse = () => setStatus("refused");

  if (status !== "pending") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: status === "accepted" ? "#EAFAF1" : "#FFEBEE" }]}>
            <MaterialIcons
              name={status === "accepted" ? "check-circle" : "cancel"}
              size={64}
              color={status === "accepted" ? "#2E7D32" : "#C62828"}
            />
          </View>
          <Text style={styles.resultTitle}>
            {status === "accepted" ? "Demanda aceita!" : "Demanda recusada"}
          </Text>
          <Text style={styles.resultText}>
            {status === "accepted"
              ? `Você aceitou a demanda "${params.title}". O status da proposta foi atualizado.`
              : `Você recusou a demanda "${params.title}".`}
          </Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={() => router.replace("/professional-home" as any)}>
            <Text style={styles.backHomeText}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Demanda</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <Text style={styles.demandTitle}>{params.title}</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.urgencyText, { color: colors.text }]}>{urgency}</Text>
            </View>
          </View>
          <Text style={styles.demandSubtitle}>{params.subtitle}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{params.client}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="attach-money" size={20} color="#2E7D32" />
            <View>
              <Text style={styles.infoLabel}>Orçamento</Text>
              <Text style={[styles.infoValue, { color: "#2E7D32" }]}>{params.budget}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={20} color="#C62828" />
            <View>
              <Text style={styles.infoLabel}>Distância</Text>
              <Text style={styles.infoValue}>{params.distance}</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionLabel}>Descrição</Text>
          <Text style={styles.descriptionText}>{params.description}</Text>
        </View>

        <View style={styles.clientCard}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {(params.client ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text style={styles.clientName}>{params.client}</Text>
            <View style={styles.clientRatingRow}>
              <MaterialIcons name="star" size={14} color="#FFB800" />
              <Text style={styles.clientRatingText}>4.7 · 8 serviços contratados</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        {erro ? <Text style={styles.actionError}>{erro}</Text> : null}
        <TouchableOpacity
          style={[styles.refuseButton, processando && styles.actionButtonDisabled]}
          onPress={handleRefuse}
          activeOpacity={0.8}
          disabled={processando}
        >
          <MaterialIcons name="close" size={20} color="#C62828" />
          <Text style={styles.refuseText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptButton, processando && styles.actionButtonDisabled]}
          onPress={() => void handleAccept()}
          activeOpacity={0.8}
          disabled={processando}
        >
          {processando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="check" size={20} color="#fff" />
          )}
          <Text style={styles.acceptText}>
            {processando ? "Aceitando..." : "Aceitar demanda"}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  container: {
    padding: 20,
    paddingBottom: 110,
  },
  titleCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  demandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    flex: 1,
    marginRight: 10,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  urgencyText: {
    fontWeight: "700",
    fontSize: 12,
  },
  demandSubtitle: {
    fontSize: 14,
    color: "#7A7A95",
  },
  infoGrid: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: "#8A8A8A",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A8A8A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  clientCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8EDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  clientAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0D3D8B",
  },
  clientName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  clientRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clientRatingText: {
    fontSize: 12,
    color: "#7A7A95",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 28,
    flexDirection: "row",
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
    flexWrap: "wrap",
  },
  actionError: {
    width: "100%",
    color: "#B3261E",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
  },
  refuseButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  refuseText: {
    color: "#C62828",
    fontWeight: "800",
    fontSize: 15,
  },
  acceptButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0D3D8B",
    borderRadius: 16,
    paddingVertical: 16,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
    textAlign: "center",
  },
  resultText: {
    fontSize: 15,
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  backHomeButton: {
    backgroundColor: "#0D3D8B",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  backHomeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
