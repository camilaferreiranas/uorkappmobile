import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Chip } from "../../components/ui/chip";
import { ProposalCard } from "../../components/ui/proposal-card";
import { ScreenContainer } from "../../components/ui/screen-container";
import { ScreenHeader } from "../../components/ui/screen-header";
import { Colors, Radii } from "../../constants/theme";

const demand = {
  title: "Instalação elétrica — 3 pontos",
  location: "Barra, Salvador · publicada há 2h",
  budget: "Orçamento sugerido: R$ 300",
};

const proposals = [
  {
    name: "Rafael Oliveira",
    initials: "RO",
    rating: 4.9,
    jobs: 128,
    message:
      "Posso fazer amanhã de manhã. Levo material básico incluso e dou garantia de 90 dias no serviço.",
    price: "R$ 280",
    eta: "Amanhã, 9h",
    highlighted: true,
  },
  {
    name: "Patrícia Silva",
    initials: "PS",
    rating: 4.8,
    jobs: 74,
    message:
      "Tenho disponibilidade ainda hoje à tarde. Material por conta do cliente.",
    price: "R$ 240",
    eta: "Hoje, 15h",
  },
  {
    name: "Carlos Mendes",
    initials: "CM",
    rating: 4.7,
    jobs: 51,
    message: "Consigo quinta-feira. Incluo revisão do quadro de energia sem custo.",
    price: "R$ 320",
    eta: "Quinta, 10h",
  },
];

const sortOptions = ["Recomendadas", "Menor preço", "Melhor avaliação"];

export default function ProposalsScreen() {
  const router = useRouter();
  const [sort, setSort] = useState("Recomendadas");

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <ScreenHeader
        title="Propostas"
        onBack={() => router.back()}
        actionIcon="tune"
        actionLabel="Filtrar propostas"
      />

      <View style={styles.demandCard}>
        <Text style={styles.demandTitle}>{demand.title}</Text>
        <View style={styles.demandRow}>
          <MaterialIcons name="schedule" size={13} color={Colors.textSecondary} />
          <Text style={styles.demandMeta}>{demand.location}</Text>
        </View>
        <Text style={styles.demandBudget}>{demand.budget}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryCount}>{proposals.length} propostas recebidas</Text>
      </View>

      <View style={styles.sortRow}>
        {sortOptions.map((option) => (
          <Chip
            key={option}
            label={option}
            active={sort === option}
            onPress={() => setSort(option)}
          />
        ))}
      </View>

      {proposals.map((p) => (
        <ProposalCard
          key={p.name}
          {...p}
          onAccept={() => router.push("/review")}
          onViewProfile={() => router.push("/profile")}
        />
      ))}

      <Pressable
        style={styles.ghost}
        onPress={() => router.push("/publish-demand")}
        accessibilityRole="button"
      >
        <MaterialIcons name="edit" size={16} color={Colors.brandPrimary} />
        <Text style={styles.ghostText}>Editar demanda</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  demandCard: {
    backgroundColor: Colors.brandTint,
    borderRadius: Radii.lg,
    padding: 16,
    marginBottom: 20,
    gap: 4,
  },
  demandTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  demandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  demandMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  demandBudget: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brandDark,
    marginTop: 4,
  },
  summaryRow: {
    marginBottom: 12,
  },
  summaryCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  ghost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 44,
    marginTop: 4,
  },
  ghostText: {
    color: Colors.brandPrimary,
    fontWeight: "800",
    fontSize: 14,
  },
});
