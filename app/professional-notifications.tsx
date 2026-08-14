import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  buscarNotificacoes,
  marcarNotificacaoComoLida,
  Notificacao,
} from "../services/notificacaoService";
import { buscarDetalheDemanda } from "../services/propostaService";

export default function ProfessionalNotificationsScreen() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregar = useCallback(async () => {
    setError("");
    try {
      const data = await buscarNotificacoes();
      setNotificacoes(data.notificacoes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar as notificações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  async function abrirNotificacao(notificacao: Notificacao) {
    try {
      if (!notificacao.lida) {
        const atualizada = await marcarNotificacaoComoLida(notificacao.id);
        setNotificacoes((current) =>
          current.map((item) => (item.id === atualizada.id ? atualizada : item))
        );
      }

      const detalhe = await buscarDetalheDemanda(notificacao.propostaId);
      router.push({
        pathname: "/demand-details",
        params: {
          id: String(detalhe.propostaId),
          title: detalhe.titulo,
          subtitle: "Proposta recebida",
          budget: `R$ ${Number(detalhe.orcamento).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
          urgency: "Normal",
          distance: detalhe.distancia == null ? "Distância indisponível" : `${detalhe.distancia} km`,
          client: detalhe.nomeCliente,
          description: detalhe.descricao,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir a proposta.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0D3D8B" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={42} color="#B3261E" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregar}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : notificacoes.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialIcons name="notifications-none" size={52} color="#9BA4B8" />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyText}>Novas propostas aparecerão aqui.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {notificacoes.map((notificacao) => (
            <TouchableOpacity
              key={notificacao.id}
              style={[styles.card, !notificacao.lida && styles.cardUnread]}
              onPress={() => void abrirNotificacao(notificacao)}
              activeOpacity={0.75}
            >
              <View style={[styles.icon, !notificacao.lida && styles.iconUnread]}>
                <MaterialIcons
                  name="description"
                  size={22}
                  color={notificacao.lida ? "#7A7A95" : "#0D3D8B"}
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{notificacao.titulo}</Text>
                  {!notificacao.lida ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.cardMessage}>{notificacao.mensagem}</Text>
                <Text style={styles.cardDate}>
                  {new Date(notificacao.dataCriacao).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#9BA4B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F4FB" },
  header: {
    backgroundColor: "#0D3D8B",
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  headerSpacer: { width: 42 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 12,
  },
  errorText: { color: "#B3261E", textAlign: "center", fontSize: 14 },
  retryButton: { backgroundColor: "#0D3D8B", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: "#fff", fontWeight: "700" },
  emptyTitle: { color: "#111", fontSize: 18, fontWeight: "800" },
  emptyText: { color: "#7A7A95", fontSize: 14 },
  list: { padding: 20, paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardUnread: { backgroundColor: "#F4F7FF", borderWidth: 1, borderColor: "#DCE6FA" },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#EFEFF4", alignItems: "center", justifyContent: "center" },
  iconUnread: { backgroundColor: "#E8EDFA" },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardTitle: { color: "#111", fontSize: 14, fontWeight: "800", flex: 1 },
  cardMessage: { color: "#5E6472", fontSize: 13, lineHeight: 18, marginTop: 3 },
  cardDate: { color: "#9BA4B8", fontSize: 11, marginTop: 7 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E75A2B" },
});
