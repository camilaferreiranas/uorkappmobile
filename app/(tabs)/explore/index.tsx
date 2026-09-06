import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { CategoryCard } from "../../../components/ui/category-card";
import { ListCard } from "../../../components/ui/list-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SectionHeader } from "../../../components/ui/section-header";
import { Colors, Radii } from "../../../constants/theme";

const categories = [
  { title: "Eletrônica", icon: "electrical-services" },
  { title: "Beleza", icon: "brush" },
  { title: "Limpeza", icon: "cleaning-services" },
  { title: "Pintura", icon: "format-paint" },
  { title: "Serviços", icon: "build" },
  { title: "Instalação", icon: "plumbing" },
  { title: "Jardinagem", icon: "grass" },
  { title: "Reparo", icon: "handyman" },
  { title: "Mudança", icon: "local-shipping" },
  { title: "Reformas", icon: "home-repair-service" },
  { title: "Aulas", icon: "school" },
  { title: "Pets", icon: "pets" },
];

const popular = [
  {
    title: "Diária de limpeza",
    subtitle: "Mais contratado esta semana",
    price: "A partir de R$ 140",
    icon: "cleaning-services" as const,
  },
  {
    title: "Reparo elétrico",
    subtitle: "Resposta média em 20 min",
    price: "A partir de R$ 120",
    icon: "electrical-services" as const,
  },
  {
    title: "Montagem de móveis",
    subtitle: "Profissionais verificados",
    price: "A partir de R$ 90",
    icon: "handyman" as const,
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explorar</Text>
      <Text style={styles.description}>
        Escolha uma categoria ou veja os serviços mais procurados.
      </Text>

      <View style={styles.grid}>
        {categories.map((c) => (
          <CategoryCard
            key={c.title}
            title={c.title}
            icon={c.icon}
            onPress={() => router.push("/search")}
          />
        ))}
      </View>

      <SectionHeader title="Serviços populares" />
      {popular.map((p) => (
        <ListCard
          key={p.title}
          title={p.title}
          subtitle={p.subtitle}
          subtitleIcon="trending-up"
          price={p.price}
          icon={p.icon}
          onPress={() => router.push("/search")}
        />
      ))}

      <View style={styles.help}>
        <MaterialIcons name="lightbulb" size={18} color={Colors.brandPrimary} />
        <Text style={styles.helpText}>
          Não achou? Publique uma demanda e receba propostas sob medida.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 110,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.brandDark,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  help: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.brandTint,
    borderRadius: Radii.md,
    padding: 14,
    marginTop: 20,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: Colors.brandDark,
    lineHeight: 18,
  },
});
