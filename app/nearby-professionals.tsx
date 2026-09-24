import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfessionalCard } from "../components/ui/professional-card";
import { ProfileScreenHeader } from "../components/ui/profile-screen-header";
import { Colors } from "../constants/theme";
import {
  buscarPaginaPrestadoresProximos,
  type Prestador,
} from "../services/prestadorService";

const PAGE_SIZE = 10;

const filtrosAvaliacao = [
  { label: "Todos", valor: null },
  { label: "4,0+ estrelas", valor: 4 },
  { label: "4,5+ estrelas", valor: 4.5 },
] as const;

function adicionarSemDuplicar(atuais: Prestador[], novos: Prestador[]) {
  const mapa = new Map(atuais.map((prestador) => [prestador.id, prestador]));
  novos.forEach((prestador) => mapa.set(prestador.id, prestador));
  return Array.from(mapa.values());
}

export default function NearbyProfessionalsScreen() {
  const router = useRouter();
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [total, setTotal] = useState(0);
  const [ultimaPagina, setUltimaPagina] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [avaliacaoMinima, setAvaliacaoMinima] = useState<number | null>(null);
  const [avaliacaoTemporaria, setAvaliacaoTemporaria] = useState<number | null>(null);
  const [filtroAberto, setFiltroAberto] = useState(false);

  const carregar = useCallback(async (pagina = 0, substituir = true) => {
    if (substituir) setCarregando(true);
    else setCarregandoMais(true);
    setErro("");

    try {
      const resultado = await buscarPaginaPrestadoresProximos(
        pagina,
        PAGE_SIZE,
        avaliacaoMinima
      );
      setPrestadores((atuais) =>
        substituir
          ? resultado.content
          : adicionarSemDuplicar(atuais, resultado.content)
      );
      setPaginaAtual(resultado.page);
      setTotal(resultado.totalElements);
      setUltimaPagina(resultado.last);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os profissionais próximos."
      );
    } finally {
      setCarregando(false);
      setCarregandoMais(false);
      setAtualizando(false);
    }
  }, [avaliacaoMinima]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  function atualizar() {
    setAtualizando(true);
    void carregar(0, true);
  }

  function carregarProximaPagina() {
    if (carregando || carregandoMais || atualizando || ultimaPagina || erro) return;
    void carregar(paginaAtual + 1, false);
  }

  function abrirPerfil(prestador: Prestador) {
    router.push({
      pathname: "/profile",
      params: { id: String(prestador.id) },
    });
  }

  function abrirFiltro() {
    setAvaliacaoTemporaria(avaliacaoMinima);
    setFiltroAberto(true);
  }

  const emptyComponent = carregando ? (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.stateText}>Buscando profissionais próximos...</Text>
    </View>
  ) : erro ? (
    <View style={styles.centerState}>
      <MaterialIcons name="error-outline" size={46} color={Colors.error} />
      <Text style={styles.errorText}>{erro}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.centerState}>
      <MaterialIcons name="person-search" size={52} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Nenhum profissional encontrado</Text>
      <Text style={styles.stateText}>
        Tente atualizar a localização ou consulte novamente mais tarde.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader
        title="Profissionais próximos"
        subtitle={total === 1 ? "1 profissional encontrado" : `${total} profissionais encontrados`}
      />

      <FlatList
        data={prestadores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProfessionalCard
            style={styles.card}
            name={item.nome}
            role={item.categorias.join(", ") || "Prestador de serviço"}
            rating={item.mediaAvaliacoes ?? 0}
            distance={
              item.distanciaKm !== null
                ? `${item.distanciaKm.toFixed(1)} km`
                : "Distância indisponível"
            }
            initials={item.nome?.substring(0, 2).toUpperCase() || "US"}
            imageUrl={item.fotoPerfilUrl}
            buttonTitle="Ver perfil"
            onPress={() => abrirPerfil(item)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          prestadores.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={carregarProximaPagina}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeading}>
            <View style={styles.listTitleRow}>
              <Text style={styles.listTitle}>Profissionais</Text>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  avaliacaoMinima != null && styles.filterButtonActive,
                ]}
                onPress={abrirFiltro}
                accessibilityRole="button"
                accessibilityLabel="Filtrar profissionais por avaliação"
              >
                <MaterialIcons
                  name="tune"
                  size={17}
                  color={avaliacaoMinima != null ? Colors.white : Colors.primary}
                />
                <Text
                  style={[
                    styles.filterText,
                    avaliacaoMinima != null && styles.filterTextActive,
                  ]}
                >
                  Filtrar
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.filterSummary}>
              {avaliacaoMinima == null
                ? "Todas as avaliações"
                : `Avaliação mínima: ${avaliacaoMinima
                    .toFixed(1)
                    .replace(".", ",")} estrelas`}
            </Text>
          </View>
        }
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={
          carregandoMais ? (
            <ActivityIndicator style={styles.footerLoading} color={Colors.primary} />
          ) : erro && prestadores.length > 0 ? (
            <TouchableOpacity
              style={styles.footerRetry}
              onPress={() => {
                setErro("");
                void carregar(paginaAtual + 1, false);
              }}
            >
              <Text style={styles.footerRetryText}>Tentar carregar mais</Text>
            </TouchableOpacity>
          ) : null
        }
      />

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
                  style={[
                    styles.filterOption,
                    selecionado && styles.filterOptionSelected,
                  ]}
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
                    name={
                      selecionado
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
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
  safeArea: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 18, paddingBottom: 40, gap: 13 },
  emptyList: { flexGrow: 1 },
  card: { width: "100%" },
  listHeading: { marginBottom: 2, gap: 6 },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  listTitle: { color: Colors.ink, fontSize: 19, fontWeight: "700" },
  filterButton: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 11,
  },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.primary, fontSize: 13, fontWeight: "700", textAlign: "center" },
  filterTextActive: { color: Colors.white },
  filterSummary: { color: Colors.textSecondary, fontSize: 13 },
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  filterModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    gap: 12,
  },
  filterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  filterTitle: { flex: 1, color: Colors.ink, fontSize: 20, fontWeight: "800" },
  filterDescription: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  filterSectionTitle: { color: Colors.ink, fontSize: 14, fontWeight: "800", marginTop: 4 },
  filterOption: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  filterOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterOptionLabel: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  filterOptionText: { color: Colors.ink, fontSize: 14, fontWeight: "600" },
  applyFilterButton: {
    minHeight: 48,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyFilterText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  centerState: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 12,
  },
  stateText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: "center" },
  errorText: { color: Colors.error, fontSize: 14, lineHeight: 20, textAlign: "center" },
  emptyTitle: { color: "#111", fontSize: 18, fontWeight: "800", textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  footerLoading: { paddingVertical: 18 },
  footerRetry: { alignItems: "center", paddingVertical: 16 },
  footerRetryText: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
});
