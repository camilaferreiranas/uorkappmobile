import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/ui/button";
import { ListCard } from "../../components/ui/list-card";
import { ReviewCard } from "../../components/ui/review-card";
import { ScreenHeader } from "../../components/ui/screen-header";
import { SectionHeader } from "../../components/ui/section-header";
import { Colors, Radii, Shadow, Spacing } from "../../constants/theme";

const services = [
  { title: "Instalação elétrica", price: "R$ 150", subtitle: "Tomada e painel", rating: 4.9 },
  { title: "Troca de lâmpadas", price: "R$ 90", subtitle: "Residencial e comercial", rating: 4.7 },
  { title: "Laudo técnico", price: "R$ 250", subtitle: "Inspeção completa", rating: 4.8 },
];

const reviews = [
  {
    name: "Mariana Costa",
    comment: "Excelente trabalho e rapidez na entrega. Recomendo!",
    rating: 5.0,
    distance: "1,0 km",
  },
  {
    name: "Felipe Alves",
    comment: "Muito profissional e demonstrou conhecimento técnico.",
    rating: 4.8,
    distance: "3,2 km",
  },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          onBack={() => router.back()}
          actionIcon="ios-share"
          actionLabel="Compartilhar"
        />

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RO</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Rafael Oliveira</Text>
            <MaterialIcons name="verified" size={18} color={Colors.brandPrimary} />
          </View>
          <Text style={styles.specialty}>Técnico em Eletrônica</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={13} color={Colors.textSecondary} />
            <Text style={styles.location}>Barra, Salvador - BA</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Conclusão</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={15} color={Colors.rating} />
              <Text style={styles.statValue}>4.9</Text>
            </View>
            <Text style={styles.statLabel}>120 avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>7 anos</Text>
            <Text style={styles.statLabel}>Experiência</Text>
          </View>
        </View>

        <Button
          title="Enviar mensagem"
          variant="outline"
          onPress={() => {}}
          style={styles.messageButton}
        />

        <SectionHeader
          title="Serviços"
          subtitle="Orçamento fechado antes de contratar"
          style={styles.section}
        />
        {services.map((s) => (
          <ListCard
            key={s.title}
            title={s.title}
            subtitle={s.subtitle}
            subtitleIcon="build"
            price={s.price}
            priceUnit="preço base"
            icon="build"
            rating={s.rating}
            onPress={() => {}}
          />
        ))}

        <SectionHeader title="Avaliações recentes" style={styles.section} />
        {reviews.map((r) => (
          <ReviewCard key={r.name} {...r} />
        ))}
      </ScrollView>

      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>A partir de</Text>
          <Text style={styles.ctaValue}>R$ 90</Text>
        </View>
        <View style={styles.ctaButton}>
          <Button title="Contratar" onPress={() => router.push("/review")} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
  },
  container: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.sectionTight,
    paddingBottom: 150,
  },
  identity: {
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: Colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: Colors.textOnBrand,
    fontSize: 26,
    fontWeight: "800",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  specialty: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.lg,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  statLabel: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  messageButton: {
    marginBottom: 4,
  },
  section: {
    marginTop: 24,
  },
  ctaBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.pill,
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    ...Shadow.floating,
  },
  ctaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ctaValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  ctaButton: {
    flex: 1,
    maxWidth: 200,
  },
});
