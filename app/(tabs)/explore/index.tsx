import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/theme";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { ProfessionalCard } from "../../../components/ui/professional-card";

const filters = [
  { key: "categoria", label: "Categoria" },
  { key: "localizacao", label: "Localização" },
  { key: "avaliacao", label: "Avaliação" },
];

const professionals = [
  {
    name: "Rafael Oliveira",
    role: "Técnico em Eletrônica",
    rating: 4.9,
    distance: "1,2 km",
    initials: "RO",
    category: "Eletrônica",
    location: "Centro",
  },
  {
    name: "Patrícia Silva",
    role: "Limpeza residencial",
    rating: 4.8,
    distance: "2,0 km",
    initials: "PS",
    category: "Limpeza",
    location: "Zona Sul",
  },
  {
    name: "Carlos Mendes",
    role: "Instalação elétrica",
    rating: 4.7,
    distance: "3,4 km",
    initials: "CM",
    category: "Eletrônica",
    location: "Bairro Alto",
  },
  {
    name: "Ana Paula",
    role: "Pintura e reformas",
    rating: 4.6,
    distance: "4,8 km",
    initials: "AP",
    category: "Pintura",
    location: "Centro",
  },
  {
    name: "João Ferreira",
    role: "Jardinagem e paisagismo",
    rating: 4.7,
    distance: "2,1 km",
    initials: "JF",
    category: "Jardinagem",
    location: "Norte",
  },
];

export default function BuscarScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return professionals.filter((p) => {
      const text = `${p.name} ${p.role} ${p.category} ${p.location}`.toLowerCase();
      const matchesQuery = query.trim() ? text.includes(query.toLowerCase()) : true;
      let matchesFilter = true;
      if (activeFilter === "categoria") matchesFilter = p.category.toLowerCase().includes("eletrônica");
      if (activeFilter === "localizacao") matchesFilter = p.location.toLowerCase().includes("centro");
      if (activeFilter === "avaliacao") matchesFilter = p.rating >= 4.8;
      return matchesQuery && matchesFilter;
    });
  }, [query, activeFilter]);

  return (
    <ScreenContainer backgroundColor="#F7F7F7" contentContainerStyle={styles.container}>
      <Text style={styles.title}>Buscar profissionais</Text>
      <Text style={styles.description}>
        Pesquise por serviço, especialista ou localidade.
      </Text>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Eletricista, pintor, limpeza..."
          placeholderTextColor={Colors.gray}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <MaterialIcons name="close" size={18} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterPill, activeFilter === filter.key && styles.filterPillActive]}
            onPress={() => setActiveFilter(activeFilter === filter.key ? null : filter.key)}
          >
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultCount}>{filtered.length} profissionais encontrados</Text>

      {filtered.map((professional) => (
        <ProfessionalCard
          key={professional.name}
          {...professional}
          buttonTitle="Ver perfil"
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 22,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 18,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: "#6B6B6B",
    fontSize: 13,
    fontWeight: "700",
  },
  filterTextActive: {
    color: Colors.white,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 14,
    fontWeight: "600",
  },
});
