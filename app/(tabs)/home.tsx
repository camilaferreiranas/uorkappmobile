import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
          <TouchableOpacity style={[styles.switchButton, styles.switchButtonActive]}>
            <Text style={[styles.switchLabel, styles.switchLabelActive]}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => router.push('/professional-home')}
          >
            <Text style={styles.switchLabel}>Profissional</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchCard}>
          <MaterialIcons name="search" size={20} color="#B0B0B0" />
          <TextInput
            placeholder="Buscar profissionais, serviços ou categoria"
            placeholderTextColor="#B0B0B0"
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 8).map((category) => (
            <View key={category.title} style={styles.categoryCard}>
              <View style={styles.categoryIconWrapper}>
                <MaterialIcons
                  name={category.icon as any}
                  size={24}
                  color="#E75A2B"
                />
              </View>
              <Text style={styles.categoryLabel}>{category.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.professionalsHeader}>
          <Text style={styles.sectionTitle}>Profissionais próximos</Text>
          <Text style={styles.viewAll}>Ver todos</Text>
        </View>

        {professionals.map((professional) => (
          <View key={professional.name} style={styles.professionalCard}>
            <View style={styles.professionalAvatar}>
              <Text style={styles.professionalAvatarText}>
                {professional.initials}
              </Text>
            </View>
            <View style={styles.professionalInfo}>
              <Text style={styles.professionalName}>{professional.name}</Text>
              <Text style={styles.professionalRole}>{professional.role}</Text>
              <View style={styles.professionalMeta}>
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>{professional.rating}</Text>
                </View>
                <Text style={styles.distanceText}>{professional.distance}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Contratar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { label: "Início", icon: "home" },
          { label: "Buscar", icon: "search" },
          { label: "Pedidos", icon: "receipt-long" },
          { label: "Chat", icon: "chat-bubble-outline" },
          { label: "Perfil", icon: "person" },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.navItem}>
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={item.label === "Início" ? "#E75A2B" : "#777"}
            />
            <Text
              style={[
                styles.navLabel,
                item.label === "Início" && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#E75A2B",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  welcome: {
    color: "#fff",
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
    color: "#fff",
    fontWeight: "800",
  },
  searchCard: {
    backgroundColor: "#fff",
    marginTop: -30,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1B1B1B",
  },
  sectionTitle: {
    color: "#1B1B1B",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    width: "23%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 12,
  },
  categoryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFE9E3",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    textAlign: "center",
    fontSize: 12,
    color: "#444",
    fontWeight: "600",
  },
  professionalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: {
    color: "#E75A2B",
    fontWeight: "700",
  },
  professionalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  professionalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E75A2B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  professionalAvatarText: {
    color: "#fff",
    fontWeight: "800",
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 3,
  },
  professionalRole: {
    fontSize: 13,
    color: "#717171",
    marginBottom: 10,
  },
  professionalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF4E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    color: "#BF6B00",
    fontWeight: "700",
    fontSize: 12,
  },
  distanceText: {
    color: "#8A8A8A",
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: "#E75A2B",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
  },
  navLabel: {
    color: "#777",
    fontSize: 11,
    marginTop: 4,
  },
  navLabelActive: {
    color: "#E75A2B",
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 4,
    marginBottom: 24,
    marginHorizontal: 0,
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
    backgroundColor: "#E75A2B",
  },
  switchLabel: {
    color: "#6B6B6B",
    fontWeight: "700",
  },
  switchLabelActive: {
    color: "#fff",
  },
});
