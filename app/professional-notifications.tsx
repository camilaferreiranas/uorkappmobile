import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../constants/theme";
import {
  type Notificacao,
} from "../services/notificacaoService";
import { buscarDetalheDemanda } from "../services/propostaService";
import { useNotifications } from "../contexts/notification-context";

export default function ProfessionalNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notificacoesPrestador: notificacoes,
    sincronizarPrestador,
    marcarComoLida,
  } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregar = useCallback(async () => {
    setError("");
    try {
      await sincronizarPrestador();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar as notificações.");
    } finally {
      setLoading(false);
    }
  }, [sincronizarPrestador]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  async function abrirNotificacao(notificacao: Notificacao) {
    try {
      if (!notificacao.lida) {
        await marcarComoLida("prestador", notificacao.id);
      }

      if (notificacao.demandaId
        || notificacao.titulo === "Serviço concluído"
        || notificacao.titulo === "Serviço ainda não concluído") {
        router.push({
          pathname: "/professional-demands",
          params: { aba: "recebidas" },
        });
        return;
      }

      const detalhe = await buscarDetalheDemanda(notificacao.propostaId);
      router.push({
        pathname: "/demand-details",
        params: {
          id: String(detalhe.propostaId),
          title: detalhe.titulo,
          subtitle: "Proposta recebida",
          urgency: detalhe.urgencia === "URGENTE" ? "Urgente" : detalhe.urgencia === "HOJE" ? "Hoje" : "Normal",
          location: detalhe.localizacao ?? "Localização não informada",
          photoUrl: detalhe.fotoUrl ?? "",
          client: detalhe.nomeCliente,
          description: detalhe.descricao,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir a proposta.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={42} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={carregar}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : notificacoes.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialIcons name="notifications-none" size={52} color={Colors.textSecondary} />
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
                  name={notificacao.demandaId ? "emoji-events" : "description"}
                  size={22}
                  color={notificacao.lida ? Colors.textSecondary : Colors.primary}
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
              <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  headerSpacer: { width: 42 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: "800" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 12,
  },
  errorText: { color: Colors.error, textAlign: "center", fontSize: 14 },
  retryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: Colors.white, fontWeight: "700" },
  emptyTitle: { color: Colors.ink, fontSize: 18, fontWeight: "800" },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  list: { padding: 20, paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardUnread: { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: Colors.primaryLight },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  iconUnread: { backgroundColor: Colors.primaryLight },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardTitle: { color: Colors.ink, fontSize: 14, fontWeight: "800", flex: 1 },
  cardMessage: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 3 },
  cardDate: { color: Colors.textSecondary, fontSize: 11, marginTop: 7 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
});
