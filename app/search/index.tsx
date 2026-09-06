import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Chip, ChipRow } from "../../components/ui/chip";
import { ListCard } from "../../components/ui/list-card";
import { ScreenContainer } from "../../components/ui/screen-container";
import { ScreenHeader } from "../../components/ui/screen-header";
import { Colors, Radii } from "../../constants/theme";

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
    <ScreenContainer>
      <ScreenHeader title="Buscar" onBack={() => router.back()} />

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
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
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

      <Text style={styles.count}>
        {results.length} {results.length === 1 ? "profissional" : "profissionais"}
      </Text>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="search-off" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nada encontrado</Text>
          <Text style={styles.emptyText}>
            Remova um filtro ou tente outro termo de busca.
          </Text>
        </View>
      ) : (
        results.map((p) => (
          <ListCard
            key={p.name}
            title={p.name}
            subtitle={`${p.specialty} · ${p.distance}`}
            subtitleIcon="work-outline"
            price={p.price}
            initials={p.initials}
            rating={p.rating}
            onPress={() => router.push("/profile")}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.pill,
    paddingHorizontal: 18,
    minHeight: 52,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  chips: {
    marginBottom: 20,
  },
  count: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
});
