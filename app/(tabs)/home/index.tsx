import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, ChipRow } from "../../../components/ui/chip";
import { ListCard } from "../../../components/ui/list-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SectionHeader } from "../../../components/ui/section-header";
import { Colors, Radii } from "../../../constants/theme";

const categories = [
  { title: "Todos", icon: "apps" as const },
  { title: "Eletrônica", icon: "electrical-services" as const },
  { title: "Limpeza", icon: "cleaning-services" as const },
  { title: "Pintura", icon: "format-paint" as const },
  { title: "Jardinagem", icon: "grass" as const },
  { title: "Reparos", icon: "handyman" as const },
];

const professionals = [
  {
    name: "Raquel Oliveira",
    subtitle: "Eletricista · 1,2 km",
    price: "A partir de R$ 120",
    initials: "RO",
    rating: 4.9,
  },
  {
    name: "Marcos Costa",
    subtitle: "Encanador · 2,4 km",
    price: "A partir de R$ 90",
    initials: "MC",
    rating: 4.7,
  },
  {
    name: "Lara Mendes",
    subtitle: "Diarista · 850 m",
    price: "A partir de R$ 140",
    initials: "LM",
    rating: 4.8,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.hello}>Olá, Mariana</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={13} color={Colors.textSecondary} />
            <Text style={styles.location}>Salvador, BA</Text>
          </View>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MC</Text>
        </View>
      </View>

      <Pressable
        style={styles.search}
        onPress={() => router.push("/search")}
        accessibilityRole="search"
        accessibilityLabel="Buscar profissionais ou serviços"
      >
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
        <Text style={styles.searchText}>Buscar profissionais ou serviços</Text>
      </Pressable>

      <View style={styles.chips}>
        <ChipRow>
          {categories.map((c, i) => (
            <Chip
              key={c.title}
              label={c.title}
              icon={c.icon}
              active={i === 0}
              onPress={() => router.push("/search")}
            />
          ))}
        </ChipRow>
      </View>

      <View style={styles.demandCta}>
        <View style={styles.demandCtaText}>
          <Text style={styles.demandCtaTitle}>Publique uma demanda</Text>
          <Text style={styles.demandCtaSub}>
            Descreva o serviço e receba propostas de profissionais.
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.demandBtn, pressed && styles.demandBtnPressed]}
          onPress={() => router.push("/publish-demand")}
          accessibilityRole="button"
        >
          <MaterialIcons name="add" size={22} color={Colors.textOnBrand} />
        </Pressable>
      </View>

      <SectionHeader
        title="Profissionais em destaque"
        actionLabel="Ver todos"
        onAction={() => router.push("/search")}
      />
      {professionals.map((p) => (
        <ListCard
          key={p.name}
          title={p.name}
          subtitle={p.subtitle}
          subtitleIcon="work-outline"
          price={p.price}
          initials={p.initials}
          rating={p.rating}
          onPress={() => router.push("/profile")}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  hello: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandDark,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.textOnBrand,
    fontWeight: "800",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.pill,
    paddingHorizontal: 18,
    minHeight: 52,
    marginBottom: 16,
  },
  searchText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  chips: {
    marginBottom: 24,
  },
  demandCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.brandDark,
    borderRadius: Radii.xl,
    padding: 18,
  },
  demandCtaText: {
    flex: 1,
  },
  demandCtaTitle: {
    color: Colors.textOnBrand,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 3,
  },
  demandCtaSub: {
    color: Colors.textOnBrandMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  demandBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  demandBtnPressed: {
    opacity: 0.85,
  },
});
