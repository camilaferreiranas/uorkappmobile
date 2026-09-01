import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileScreenHeader } from "../components/ui/profile-screen-header";
import { Colors } from "../constants/theme";
import { useNotifications } from "../contexts/notification-context";
import { buscarContatoWhatsApp } from "../services/propostaService";
import {
  type Notificacao,
} from "../services/notificacaoService";

export default function ClientNotificationsScreen() {
  const {
    notificacoesCliente: notificacoes,
    sincronizarCliente,
    marcarComoLida,
  } = useNotifications();
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [abrindoWhatsAppId, setAbrindoWhatsAppId] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (exibirCarregamento = true) => {
    if (exibirCarregamento) setCarregando(true);
    setErro("");

    try {
      await sincronizarCliente();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as notificações."
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [sincronizarCliente]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  async function abrir(notificacao: Notificacao) {
    if (notificacao.lida) return;

    try {
      await marcarComoLida("cliente", notificacao.id);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a notificação."
      );
    }
  }

  async function conversarNoWhatsApp(notificacao: Notificacao) {
    setAbrindoWhatsAppId(notificacao.id);

    try {
      if (!notificacao.lida) {
        await marcarComoLida("cliente", notificacao.id);
      }
      const contato = await buscarContatoWhatsApp(notificacao.propostaId);
      await Linking.openURL(contato.whatsappUrl);
    } catch (error) {
      Alert.alert(
        "Não foi possível abrir o WhatsApp",
        error instanceof Error
          ? error.message
          : "Tente novamente em alguns instantes."
      );
    } finally {
      setAbrindoWhatsAppId(null);
    }
  }

  function atualizar() {
    setAtualizando(true);
    void carregar(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader title="Notificações" />

      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : erro ? (
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={44} color="#B3261E" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : notificacoes.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialIcons name="notifications-none" size={52} color="#A4A4AD" />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyText}>As atualizações das suas propostas aparecerão aqui.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizar}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {notificacoes.map((notificacao) => (
            <View
              key={notificacao.id}
              style={[styles.card, !notificacao.lida && styles.cardUnread]}
            >
              <TouchableOpacity
                style={styles.notificationRow}
                activeOpacity={notificacao.lida ? 1 : 0.75}
                onPress={() => void abrir(notificacao)}
              >
                <View style={[styles.icon, !notificacao.lida && styles.iconUnread]}>
                  <MaterialIcons
                    name="check-circle-outline"
                    size={23}
                    color={notificacao.lida ? "#85858F" : Colors.primary}
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
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => void conversarNoWhatsApp(notificacao)}
                disabled={abrindoWhatsAppId === notificacao.id}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Conversar com o prestador pelo WhatsApp"
              >
                {abrindoWhatsAppId === notificacao.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialIcons name="chat" size={18} color="#fff" />
                )}
                <Text style={styles.whatsappButtonText}>
                  Conversar no WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 34,
    gap: 12,
  },
  errorText: { color: "#B3261E", fontSize: 14, textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  emptyTitle: { color: "#111", fontSize: 18, fontWeight: "800" },
  emptyText: { color: "#777780", fontSize: 14, textAlign: "center", lineHeight: 20 },
  list: { padding: 20, paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardUnread: { backgroundColor: "#FFF8F5", borderWidth: 1, borderColor: "#FFDCCF" },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFEFF2",
    alignItems: "center",
    justifyContent: "center",
  },
  iconUnread: { backgroundColor: "#FFE7DE" },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardTitle: { color: "#111", fontSize: 14, fontWeight: "800", flex: 1 },
  cardMessage: { color: "#5E6472", fontSize: 13, lineHeight: 18, marginTop: 3 },
  cardDate: { color: "#9999A2", fontSize: 11, marginTop: 7 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  whatsappButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#1FA855",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 13,
    paddingHorizontal: 14,
  },
  whatsappButtonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
