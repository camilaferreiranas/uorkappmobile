import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryCard } from "../../../components/ui/category-card";
import { ProfessionalCard } from "../../../components/ui/professional-card";
import { SectionHeader } from "../../../components/ui/section-header";
import { Colors } from "../../../constants/theme";
import { useAuth } from "../../../contexts/auth-context";

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
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Prestador[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [professionalsError, setProfessionalsError] = useState("");


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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>


            <Text style={styles.welcome}>Olá, {user?.nome ?? "Usuário"}!</Text>

            <Text style={styles.subtitle}>
              Encontre o profissional ideal para você
            </Text>
          </View>
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
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    marginRight: 12,
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
