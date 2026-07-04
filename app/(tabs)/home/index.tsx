import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { obterUsuario } from "../../../services/storageService";

const categories = [
  { title: "Eletrônica", icon: "flash" },
  { title: "Beleza", icon: "face-woman" },
  { title: "Limpeza", icon: "broom" },
  { title: "Pintura", icon: "palette" },
  { title: "Serviços", icon: "wrench" },
  { title: "Instalação", icon: "pipe" },
  { title: "Jardinagem", icon: "tree-outline" },
  { title: "Reparo", icon: "hammer" },
];

const professionals = [
  { name: "Raquel Oliveira", role: "Técnica em eletricidade", rating: 4.9, distance: "1,2 km", initials: "RO" },
  { name: "Marcos Costa", role: "Pintor e reformas", rating: 4.7, distance: "2,4 km", initials: "MC" },
  { name: "Lara Mendes", role: "Faxineira profissional", rating: 4.8, distance: "850 m", initials: "LM" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    async function carregarUsuario() {
      const dados = await obterUsuario();
      setUsuario(dados);
    }

    carregarUsuario();
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
            <Text style={styles.welcome}>Olá, {usuario?.nome || 'Usuário'}! </Text>
            <Text style={styles.subtitle}>
              Encontre o profissional ideal para você
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{usuario?.nome?.substring(0, 2).toUpperCase() || "US"}</Text>
          </View>
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
                  params: { category: category.title },
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
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.name}
              {...professional}
              buttonTitle="Contratar"
              onPress={() => router.push("/profile")}
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
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  welcome: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#FFE5D9",
    fontSize: 14,
    lineHeight: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
});
