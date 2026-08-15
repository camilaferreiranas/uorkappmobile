import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryCard } from "../../../components/ui/category-card";
import { ProfessionalCard } from "../../../components/ui/professional-card";
import { SectionHeader } from "../../../components/ui/section-header";
import { Colors } from "../../../constants/theme";
import { useAuth } from "../../../contexts/auth-context";
import { useNotifications } from "../../../contexts/notification-context";

import {
  buscarPrestadoresProximos,
  type Prestador,
} from "../../../services/prestadorService";


const categories = [
  { id: 1, title: "Eletrônica", icon: "flash" },
  { id: 2, title: "Beleza", icon: "face-woman" },
  { id: 3, title: "Limpeza", icon: "broom" },
  { id: 4, title: "Pintura", icon: "palette" },
  { id: 5, title: "Serviços", icon: "wrench" },
  { id: 6, title: "Instalação", icon: "pipe" },
  { id: 7, title: "Jardinagem", icon: "tree-outline" },
  { id: 8, title: "Reparo", icon: "hammer" },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { notificacoesCliente, naoLidasCliente } = useNotifications();
  const [professionals, setProfessionals] = useState<Prestador[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [professionalsError, setProfessionalsError] = useState("");
  const ultimaNotificacao = notificacoesCliente.find((notificacao) => !notificacao.lida) ?? null;


  useEffect(() => {
    async function carregarProfissionais() {
      try {
        setLoadingProfessionals(true);
        setProfessionalsError("");
        setProfessionals(await buscarPrestadoresProximos());
      } catch (error) {
        setProfessionalsError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os profissionais."
        );
      } finally {
        setLoadingProfessionals(false);
      }
    }

    carregarProfissionais();
  }, []);

  
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerText}>


            <Text style={styles.welcome}>Olá, {user?.nome ?? "Usuário"}!</Text>

            <Text style={styles.subtitle}>
              Encontre o profissional ideal para você
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/client-notifications" as Href)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Notificações: ${naoLidasCliente} não lidas`}
            >
              <MaterialIcons name="notifications-none" size={23} color="#fff" />
              {naoLidasCliente > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {naoLidasCliente > 99 ? "99+" : naoLidasCliente}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/(tabs)/perfil")}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
            >
              <Text style={styles.avatarText}>
                {user?.nome?.substring(0, 2).toUpperCase() ?? "US"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {ultimaNotificacao ? (
          <TouchableOpacity
            style={styles.notificationCard}
            onPress={() => router.push("/client-notifications" as Href)}
            activeOpacity={0.8}
          >
            <View style={styles.notificationCardIcon}>
              <MaterialIcons name="check-circle-outline" size={22} color={Colors.primary} />
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

        {/* Toggle Cliente/Profissional */}
        <View style={styles.switchRow}>
          <TouchableOpacity style={[styles.switchButton, styles.switchButtonActive]}>
            <Text style={[styles.switchLabel, styles.switchLabelActive]}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => router.push("/professional-home")}
          >
            <Text style={styles.switchLabel}>Profissional</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchCard}>
          <MaterialIcons name="search" size={22} color={Colors.gray} />
          <TextInput
            placeholder="Buscar profissionais, serviços..."
            placeholderTextColor={Colors.gray}
            style={styles.searchInput}
          />
        </View>

        {/* Categories */}
        <SectionHeader title="Categorias" style={styles.sectionHeader} />
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              icon={category.icon}
              onPress={() =>
                router.push({
                  pathname: "/category-providers",
                  params: { 
                    category: category.title,
                    categoriaId: String(category.id),
                  },
                })
              }
            />
          ))}
        </View>

        {/* Professionals */}
        <SectionHeader
          title="Profissionais próximos"
          subtitle="Ver todos"
          style={styles.sectionHeader}
        />
        <View style={styles.professionalsContainer}>
          {loadingProfessionals ? (
            <ActivityIndicator color={Colors.primary} />
          ) : professionalsError ? (
            <Text style={styles.professionalsMessage}>{professionalsError}</Text>
          ) : professionals.length === 0 ? (
            <Text style={styles.professionalsMessage}>
              Nenhum profissional disponível no momento.
            </Text>
          ) : professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              name={professional.nome}
              role={professional.categorias.join(", ") || "Prestador de serviço"}
              rating={professional.mediaAvaliacoes ?? 0}
              distance={professional.distanciaKm !== null ? `${professional.distanciaKm.toFixed(1)} km` : "Distância indisponível"}
              initials={professional.nome?.substring(0, 2).toUpperCase() || "US"}
              buttonTitle="Contratar"
              onPress={() =>
                router.push({
                  pathname: "/profile",
                  params: { id: professional.id.toString() },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    paddingBottom: 110,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#B3261E",
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  welcome: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#FFE5D9",
    fontSize: 13,
    lineHeight: 18,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "800",
    fontSize: 16,
  },
  notificationCard: {
    marginHorizontal: 22,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFF8F5",
    borderWidth: 1,
    borderColor: "#FFDCCF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFE7DE",
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
    color: "#5E6472",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 4,
    marginHorizontal: 22,
    marginTop: 18,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  switchButtonActive: {
    backgroundColor: Colors.primary,
  },
  switchLabel: {
    color: Colors.gray,
    fontWeight: "700",
    fontSize: 15,
  },
  switchLabelActive: {
    color: Colors.white,
  },
  searchCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 22,
    marginTop: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
  },
  sectionHeader: {
    marginHorizontal: 22,
    marginTop: 28,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 22,
    gap: 12,
  },
  professionalsContainer: {
    paddingHorizontal: 22,
    gap: 14,
    marginTop: 4,
  },
  professionalsMessage: {
    color: Colors.gray,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingVertical: 16,
  },
});
