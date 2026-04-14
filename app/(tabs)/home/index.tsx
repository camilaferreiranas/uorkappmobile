import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/theme";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { CategoryCard } from "../../../components/ui/category-card";
import { ProfessionalCard } from "../../../components/ui/professional-card";
import { SectionHeader } from "../../../components/ui/section-header";

const categories = [
  { title: "Eletrônica", icon: "electrical-services" },
  { title: "Beleza", icon: "brush" },
  { title: "Limpeza", icon: "cleaning-services" },
  { title: "Pintura", icon: "format-paint" },
  { title: "Serviços", icon: "build" },
  { title: "Instalação", icon: "plumbing" },
  { title: "Jardinagem", icon: "grass" },
  { title: "Reparo", icon: "handyman" },
];

const professionals = [
  {
    name: "Raquel Oliveira",
    role: "Técnica em eletricidade",
    rating: 4.9,
    distance: "1,2 km",
    initials: "RO",
  },
  {
    name: "Marcos Costa",
    role: "Encadernador",
    rating: 4.7,
    distance: "2,4 km",
    initials: "MC",
  },
  {
    name: "Lara Mendes",
    role: "Faxineira",
    rating: 4.8,
    distance: "850 m",
    initials: "LM",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer backgroundColor="#F7F7F7" contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Olá, Mariana!</Text>
          <Text style={styles.subtitle}>
            Precisa de ajuda para encontrar profissionais?
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MC</Text>
        </View>
      </View>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchButton, styles.switchButtonActive]}
        >
          <Text style={[styles.switchLabel, styles.switchLabelActive]}>
            Cliente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => router.push("/professional-home")}
        >
          <Text style={styles.switchLabel}>Profissional</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchCard}>
        <MaterialIcons name="search" size={20} color={Colors.gray} />
        <TextInput
          placeholder="Buscar profissionais, serviços ou categoria"
          placeholderTextColor={Colors.gray}
          style={styles.searchInput}
        />
      </View>

      <SectionHeader title="Categorias" style={styles.sectionHeader} />
      <View style={styles.categoriesGrid}>
        {categories.slice(0, 8).map((category) => (
          <CategoryCard 
            key={category.title}
            title={category.title}
            icon={category.icon}
          />
        ))}
      </View>

      <SectionHeader 
        title="Profissionais próximos" 
        subtitle="Ver todos" 
        style={styles.sectionHeader} 
      />

      {professionals.map((professional) => (
        <ProfessionalCard 
          key={professional.name}
          {...professional}
          buttonTitle="Contratar"
          onPress={() => router.push("/profile")}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  welcome: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#FFECE4",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 220,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "800",
  },
  searchCard: {
    backgroundColor: Colors.white,
    marginTop: -30,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  sectionHeader: {
    marginHorizontal: 0,
    marginBottom: 14,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 4,
    marginBottom: 24,
    alignSelf: "center",
    width: "100%",
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
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
  },
  switchLabelActive: {
    color: Colors.white,
  },
});
