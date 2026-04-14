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
import { Colors } from "../../constants/theme";
import { ScreenContainer } from "../../components/ui/screen-container";
import { ProfessionalCard } from "../../components/ui/professional-card";

const filters = [
  { key: "categoria", label: "Categoria" },
  { key: "localizacao", label: "Localização" },
  { key: "avaliacao", label: "Avaliação" },
];

const professionals = [
  {
    name: "Rafael Oliveira",
    specialty: "Técnico em Eletrônica",
    rating: 4.9,
    distance: "1.2 km",
    initials: "RO",
    category: "Eletrônica",
    location: "Centro",
  },
  {
    name: "Patrícia Silva",
    specialty: "Limpeza residencial",
    rating: 4.8,
    distance: "2.0 km",
    initials: "PS",
    category: "Limpeza",
    location: "Zona Sul",
  },
  {
    name: "Carlos Mendes",
    specialty: "Instalação elétrica",
    rating: 4.7,
    distance: "3.4 km",
    initials: "CM",
    category: "Eletrônica",
    location: "Bairro Alto",
  },
  {
    name: "Ana Paula",
    specialty: "Pintura e reformas",
    rating: 4.6,
    distance: "4.8 km",
    initials: "AP",
    category: "Pintura",
    location: "Centro",
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((professional) => {
      const text =
        `${professional.name} ${professional.specialty} ${professional.category} ${professional.location}`.toLowerCase();
      const matchesQuery = query.trim()
        ? text.includes(query.toLowerCase())
        : true;
      let matchesFilter = true;

      if (activeFilter === "categoria") {
        matchesFilter = professional.category
          .toLowerCase()
          .includes("eletrônica");
      }
      if (activeFilter === "localizacao") {
        matchesFilter = professional.location.toLowerCase().includes("centro");
      }
      if (activeFilter === "avaliacao") {
        matchesFilter = professional.rating >= 4.8;
      }

      return matchesQuery && matchesFilter;
    });
  }, [query, activeFilter]);

  return (
    <ScreenContainer backgroundColor="#F7F7F7">
      <Text style={styles.title}>Buscar profissionais</Text>
      <Text style={styles.description}>
        Pesquise por serviço, especialista ou localidade e encontre o
        profissional ideal.
      </Text>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busque por eletricista, pintor, limpeza..."
          placeholderTextColor={Colors.gray}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filtersRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterPill,
              activeFilter === filter.key && styles.filterPillActive,
            ]}
            onPress={() =>
              setActiveFilter(activeFilter === filter.key ? null : filter.key)
            }
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultCount}>
        {filteredProfessionals.length} profissionais encontrados
      </Text>

      {filteredProfessionals.map((professional) => (
        <ProfessionalCard
          key={professional.name}
          {...professional}
          onPress={() => router.push("/profile")}
        />
      ))}
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
    color: "#6B6B6B",
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
    color: "#6B6B6B",
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
});
