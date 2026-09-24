import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfessionalCard } from "../../components/ui/professional-card";
import { ProfileScreenHeader } from "../../components/ui/profile-screen-header";
import { Colors } from "../../constants/theme";
import { buscarPrestadoresCategoria, Prestador } from "../../services/prestadorService";

const filtrosAvaliacao = [
  { label: "Todos", valor: null },
  { label: "4,0+ estrelas", valor: 4 },
  { label: "4,5+ estrelas", valor: 4.5 },
] as const;
export default function CategoryProvidersScreen() {
  const router = useRouter();

  const { category, categoriaId } = useLocalSearchParams<{
    category: string;
    categoriaId: string;
  }>();

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [avaliacaoMinima, setAvaliacaoMinima] = useState<number | null>(null);
  const [avaliacaoTemporaria, setAvaliacaoTemporaria] = useState<number | null>(null);
  const [filtroAberto, setFiltroAberto] = useState(false);

  function abrirFiltro() {
    setAvaliacaoTemporaria(avaliacaoMinima);
    setFiltroAberto(true);
  }

  useEffect(() => {
    async function carregarPrestadores() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await buscarPrestadoresCategoria(Number(categoriaId), avaliacaoMinima);
        if (ativo) setPrestadores(dados);
      } catch (error) {
        if (ativo) setErro(error instanceof Error
          ? error.message
          : "Não foi possível carregar os profissionais.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    let ativo = true;
    if (categoriaId) {
      void carregarPrestadores();
    }
    return () => { ativo = false; };
  }, [avaliacaoMinima, categoriaId]);

  const subtitulo = carregando
    ? "Carregando profissionais..."
    : `${prestadores.length} ${
        prestadores.length === 1
          ? "profissional disponível"
          : "profissionais disponíveis"
      }`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader title={category ?? "Categoria"} subtitle={subtitulo} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listHeading}>
          <View style={styles.listTitleRow}>
            <Text style={styles.listTitle}>Profissionais</Text>
            <TouchableOpacity
              style={[styles.filterButton, avaliacaoMinima != null && styles.filterButtonActive]}
              onPress={abrirFiltro}
              accessibilityRole="button"
              accessibilityLabel="Filtrar profissionais por avaliação"
            >
              <MaterialIcons
                name="tune"
                size={17}
                color={avaliacaoMinima != null ? Colors.white : Colors.primary}
              />
              <Text style={[styles.filterText, avaliacaoMinima != null && styles.filterTextActive]}>
                Filtrar
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.filterSummary}>
            {avaliacaoMinima == null
              ? "Todas as avaliações"
              : `Avaliação mínima: ${avaliacaoMinima.toFixed(1).replace(".", ",")} estrelas`}
          </Text>
        </View>

        {carregando ? (
          <ActivityIndicator style={styles.loading} size="large" color={Colors.primary} />
        ) : erro ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="error-outline" size={50} color={Colors.error} />
            <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
            <Text style={styles.emptyText}>{erro}</Text>
          </View>
        ) : prestadores.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={56} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum profissional encontrado</Text>
            <Text style={styles.emptyText}>
              {avaliacaoMinima == null
                ? "Não há profissionais cadastrados nessa categoria ainda."
                : "Não há profissionais com essa avaliação nesta categoria."}
            </Text>
          </View>
        ) : (
          prestadores.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              style={styles.providerCard}
              name={professional.nome}
              role="Prestador de serviço"
              rating={professional.mediaAvaliacoes ?? 0}
              distance={professional.distanciaKm != null
                ? `${professional.distanciaKm.toFixed(1)} km`
                : "Distância indisponível"}
              initials={professional.nome?.substring(0, 2).toUpperCase() || "US"}
              imageUrl={professional.fotoPerfilUrl}
              //category={category ?? ""}
              buttonTitle="Ver perfil"
              onPress={() =>
                router.push({
                  pathname: "/profile",
                  params: { id: professional.id.toString() },
                })
              }
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={filtroAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltroAberto(false)}
      >
        <View style={styles.filterOverlay}>
          <View style={styles.filterModal} accessibilityViewIsModal>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterTitle}>Filtrar profissionais</Text>
              <TouchableOpacity
                onPress={() => setFiltroAberto(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar filtros"
              >
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.filterDescription}>
              Escolha a avaliação mínima dos profissionais que deseja visualizar.
            </Text>
            <Text style={styles.filterSectionTitle}>Avaliação</Text>
            {filtrosAvaliacao.map((filtro) => {
              const selecionado = avaliacaoTemporaria === filtro.valor;
              return (
                <TouchableOpacity
                  key={filtro.label}
                  style={[styles.filterOption, selecionado && styles.filterOptionSelected]}
                  onPress={() => setAvaliacaoTemporaria(filtro.valor)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selecionado }}
                >
                  <View style={styles.filterOptionLabel}>
                    {filtro.valor != null ? (
                      <MaterialIcons name="star" size={18} color={Colors.warning} />
                    ) : null}
                    <Text style={styles.filterOptionText}>{filtro.label}</Text>
                  </View>
                  <MaterialIcons
                    name={selecionado ? "radio-button-checked" : "radio-button-unchecked"}
                    size={22}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.applyFilterButton}
              onPress={() => {
                setAvaliacaoMinima(avaliacaoTemporaria);
                setFiltroAberto(false);
              }}
              accessibilityRole="button"
            >
              <Text style={styles.applyFilterText}>Aplicar filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingTop: 14,
    paddingBottom: 50,
    gap: 6,
  },
  listHeading: { paddingHorizontal: 12, marginBottom: 12, gap: 6 },
  listTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  listTitle: { color: Colors.ink, fontSize: 19, fontWeight: "700" },
  filterButton: { minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 11 },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.primary, fontSize: 13, fontWeight: "700", textAlign: "center" },
  filterTextActive: { color: Colors.white },
  filterSummary: { color: Colors.textSecondary, fontSize: 13 },
  filterOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.48)", alignItems: "center", justifyContent: "center", padding: 20 },
  filterModal: { width: "100%", maxWidth: 420, backgroundColor: Colors.white, borderRadius: 22, padding: 20, gap: 12 },
  filterModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  filterTitle: { flex: 1, color: Colors.ink, fontSize: 20, fontWeight: "800" },
  filterDescription: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  filterSectionTitle: { color: Colors.ink, fontSize: 14, fontWeight: "800", marginTop: 4 },
  filterOption: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  filterOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterOptionLabel: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  filterOptionText: { color: Colors.ink, fontSize: 14, fontWeight: "600" },
  applyFilterButton: { minHeight: 48, marginTop: 4, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  applyFilterText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  loading: { marginTop: 70 },
  providerCard: {
    marginHorizontal: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
