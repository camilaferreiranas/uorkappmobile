import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Chip, ChipRow } from "../../components/ui/chip";
import { ProfessionalCard } from "../../components/ui/professional-card";
import { ScreenContainer } from "../../components/ui/screen-container";
import { Colors } from "../../constants/theme";

const filters = [
  { key: "categoria", label: "Eletrônica" },
  { key: "localizacao", label: "No Centro" },
  { key: "avaliacao", label: "4,8+ estrelas" },
];

const professionals = [
  {
    name: "Rafael Oliveira",
    specialty: "Técnico em Eletrônica",
    rating: 4.9,
    distance: "1,2 km",
    price: "A partir de R$ 150",
    initials: "RO",
    category: "Eletrônica",
    location: "Centro",
  },
  {
    name: "Patrícia Silva",
    specialty: "Limpeza residencial",
    rating: 4.8,
    distance: "2,0 km",
    price: "A partir de R$ 140",
    initials: "PS",
    category: "Limpeza",
    location: "Zona Sul",
  },
  {
    name: "Carlos Mendes",
    specialty: "Instalação elétrica",
    rating: 4.7,
    distance: "3,4 km",
    price: "A partir de R$ 120",
    initials: "CM",
    category: "Eletrônica",
    location: "Bairro Alto",
  },
  {
    name: "Ana Paula",
    specialty: "Pintura e reformas",
    rating: 4.6,
    distance: "4,8 km",
    price: "A partir de R$ 200",
    initials: "AP",
    category: "Pintura",
    location: "Centro",
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    return professionals.filter((p) => {
      const text = `${p.name} ${p.specialty} ${p.category} ${p.location}`.toLowerCase();
      const matchesQuery = query.trim() ? text.includes(query.toLowerCase()) : true;
      let matchesFilter = true;
      if (activeFilter === "categoria")
        matchesFilter = p.category.toLowerCase().includes("eletrônica");
      if (activeFilter === "localizacao")
        matchesFilter = p.location.toLowerCase().includes("centro");
      if (activeFilter === "avaliacao") matchesFilter = p.rating >= 4.8;
      return matchesQuery && matchesFilter;
    });
  }, [query, activeFilter]);

  return (
    <ScreenContainer backgroundColor={Colors.background}>
      <Text style={styles.title}>Buscar profissionais</Text>
      <Text style={styles.description}>
        Pesquise por serviço, especialista ou localidade e encontre o
        profissional ideal.
      </Text>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Eletricista, pintor, limpeza..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoFocus
          testID="search-input"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            testID="search-clear-button"
          >
            <MaterialIcons name="close" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.chips}>
        <ChipRow>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={activeFilter === f.key}
              onPress={() =>
                setActiveFilter(activeFilter === f.key ? null : f.key)
              }
            />
          ))}
        </ChipRow>
      </View>

      <Text testID="search-results-count" style={styles.resultCount}>
        {results.length} {results.length === 1 ? "profissional" : "profissionais"}
      </Text>

      <View testID="search-results-list">
        {filteredProfessionals.map((professional) => (
          <ProfessionalCard
            key={professional.name}
            {...professional}
            style={styles.professionalCard}
            onPress={() => router.push("/profile")}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 18,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  filterTextActive: {
    color: Colors.white,
  },
  resultCount: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
  },
  professionalCard: {
    marginBottom: 10,
  },
});
