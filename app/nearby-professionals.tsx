import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  const carregar = useCallback(async (pagina = 0, substituir = true) => {
    if (substituir) setCarregando(true);
    else setCarregandoMais(true);
    setErro("");

    try {
      const resultado = await buscarPaginaPrestadoresProximos(pagina, PAGE_SIZE);
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
  }, []);

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

  const emptyComponent = carregando ? (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.stateText}>Buscando profissionais próximos...</Text>
    </View>
  ) : erro ? (
    <View style={styles.centerState}>
      <MaterialIcons name="error-outline" size={46} color="#B3261E" />
      <Text style={styles.errorText}>{erro}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => void carregar()}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.centerState}>
      <MaterialIcons name="person-search" size={52} color="#A4A4AD" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  list: { padding: 18, paddingBottom: 40, gap: 13 },
  emptyList: { flexGrow: 1 },
  card: { width: "100%" },
  centerState: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 12,
  },
  stateText: { color: "#777780", fontSize: 14, lineHeight: 20, textAlign: "center" },
  errorText: { color: "#B3261E", fontSize: 14, lineHeight: 20, textAlign: "center" },
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
