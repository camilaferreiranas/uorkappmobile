import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../constants/theme";
import { ProfessionalCard } from "../../../components/ui/professional-card";
import {
  buscarPrestadoresPorTermo,
  type Prestador,
} from "../../../services/prestadorService";

const filters = [
  { key: "categoria", label: "Categoria" },
  { key: "localizacao", label: "Localização" },
  { key: "avaliacao", label: "Avaliação" },
];

export default function BuscarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<Prestador[]>([]);
  const [totalProfessionals, setTotalProfessionals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const result = await buscarPrestadoresPorTermo(query);
        if (cancelled) return;
        setProfessionals(result.content);
        setTotalProfessionals(result.totalElements);
      } catch (requestError) {
        if (cancelled) return;
        setProfessionals([]);
        setTotalProfessionals(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível buscar os profissionais."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const filtered = useMemo(() => {
    if (activeFilter === "avaliacao") {
      return professionals.filter(
        (professional) => professional.mediaAvaliacoes >= 4.8
      );
    }
    return professionals;
  }, [activeFilter, professionals]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Buscar profissionais</Text>
        <Text style={styles.description}>
          Pesquise por serviço, especialista ou localidade.
        </Text>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nome, serviço, categoria..."
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
          {activeFilter === "avaliacao"
            ? filtered.length
            : totalProfessionals}{" "}
          profissionais encontrados
        </Text>

        {loading ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.feedbackText}>Buscando profissionais...</Text>
          </View>
        ) : error ? (
          <View style={styles.feedbackContainer}>
            <MaterialIcons name="error-outline" size={34} color="#B3261E" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.feedbackContainer}>
            <MaterialIcons name="person-search" size={38} color={Colors.gray} />
            <Text style={styles.feedbackText}>
              Nenhum profissional encontrado para essa busca.
            </Text>
          </View>
        ) : (
          filtered.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              name={professional.nome}
              role={professional.categorias.join(", ") || "Prestador de serviço"}
              rating={professional.mediaAvaliacoes ?? 0}
              distance={
                professional.distanciaKm !== null
                  ? `${professional.distanciaKm.toFixed(1)} km`
                  : "Distância indisponível"
              }
              initials={professional.nome.substring(0, 2).toUpperCase() || "US"}
              style={styles.professionalCard}
              buttonTitle="Ver perfil"
              onPress={() =>
                router.push({
                  pathname: "/profile",
                  params: { id: String(professional.id) },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
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
  feedbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  feedbackText: {
    color: Colors.gray,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  errorText: {
    color: "#B3261E",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  professionalCard: {
    marginBottom: 10,
  },
});
