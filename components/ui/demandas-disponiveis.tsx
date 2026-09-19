import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDemandasDisponiveis } from "../../hooks/use-demandas-disponiveis";
import { buscarCategorias, type Categoria } from "../../services/categoriaService";
import { type DemandaDisponivel, type OrdenacaoDemanda } from "../../services/demandaService";

const opcoesOrdenacao: { valor: OrdenacaoDemanda; titulo: string }[] = [
  { valor: "RECENTES", titulo: "Mais recentes" },
  { valor: "MAIOR_ORCAMENTO", titulo: "Maior orçamento primeiro" },
  { valor: "MENOR_ORCAMENTO", titulo: "Menor orçamento primeiro" },
];

const urgencias = {
  NORMAL: { label: "Normal", color: "#2E7D32", backgroundColor: "#EAFAF1" },
  URGENTE: { label: "Urgente", color: "#A84A16", backgroundColor: "#FFF0E6" },
  HOJE: { label: "Hoje", color: "#B3261E", backgroundColor: "#FDECEA" },
};

function DemandaCard({ demanda }: { demanda: DemandaDisponivel }) {
  const router = useRouter();
  const urgencia = urgencias[demanda.urgencia] ?? urgencias.NORMAL;
  return (
    <TouchableOpacity
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ver demanda: ${demanda.titulo}`}
      activeOpacity={0.8}
      onPress={() => router.push(`/available-demand-details?id=${demanda.id}` as Href)}
    >
      <View style={styles.tags}>
        <Text style={styles.category}>{demanda.categoria}</Text>
        <Text style={[styles.badge, { color: urgencia.color, backgroundColor: urgencia.backgroundColor }]}>{urgencia.label}</Text>
        {demanda.candidaturaId ? <Text style={styles.appliedBadge}>Candidatura enviada</Text> : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>{demanda.titulo}</Text>
      <Text style={styles.description} numberOfLines={2}>{demanda.descricao}</Text>
      <Text style={styles.budget}>{demanda.orcamento == null ? "Orçamento a combinar" : Number(demanda.orcamento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={17} color="#64748B" />
        <Text style={styles.infoText} numberOfLines={2}>{demanda.localizacao}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="person-outline" size={17} color="#64748B" />
        <Text style={styles.infoText} numberOfLines={1}>{demanda.nomeCliente}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{new Date(demanda.criadoEm).toLocaleDateString("pt-BR")}</Text>
        <Text style={styles.link}>Ver detalhes</Text>
        <MaterialIcons name="chevron-right" size={20} color="#0D3D8B" />
      </View>
    </TouchableOpacity>
  );
}

function EstadoLista({ carregando, erro, recarregar, categoria, limparFiltro }: {
  carregando: boolean;
  erro: string;
  recarregar: () => void;
  categoria?: Categoria | null;
  limparFiltro?: () => void;
}) {
  return (
    <View style={styles.state}>
      {carregando ? <ActivityIndicator color="#0D3D8B" size="large" /> : <MaterialIcons name={erro ? "error-outline" : "assignment"} size={36} color="#0D3D8B" />}
      <Text style={styles.stateTitle}>{carregando ? "Carregando demandas..." : erro ? "Não foi possível carregar" : categoria ? "Nenhuma demanda nesta atividade" : "Nenhuma demanda disponível"}</Text>
      {!carregando && <Text style={styles.stateText}>{erro || (categoria ? `Não há demandas abertas em ${categoria.nome} no momento. Tente outra atividade ou veja todas.` : "As demandas abertas de outros clientes aparecerão aqui. Suas próprias publicações não são exibidas.")}</Text>}
      {!carregando && <TouchableOpacity style={styles.button} accessibilityRole="button" onPress={recarregar}><Text style={styles.buttonText}>{erro ? "Tentar novamente" : "Atualizar"}</Text></TouchableOpacity>}
      {!carregando && !erro && categoria && limparFiltro && <TouchableOpacity accessibilityRole="button" onPress={limparFiltro}><Text style={styles.clearFilterText}>Ver todas as atividades</Text></TouchableOpacity>}
    </View>
  );
}

export function DemandasDisponiveisLista({ categoriaSelecionada, onSelecionarCategoria, ordenacaoSelecionada, onSelecionarOrdenacao }: {
  categoriaSelecionada: Categoria | null;
  onSelecionarCategoria: (categoria: Categoria | null) => void;
  ordenacaoSelecionada: OrdenacaoDemanda;
  onSelecionarOrdenacao: (ordenacao: OrdenacaoDemanda) => void;
}) {
  const lista = useDemandasDisponiveis(20, categoriaSelecionada?.id ?? null, ordenacaoSelecionada);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colunas = width >= 700 ? 2 : 1;
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaTemporaria, setCategoriaTemporaria] = useState<Categoria | null>(null);
  const [ordenacaoTemporaria, setOrdenacaoTemporaria] = useState<OrdenacaoDemanda>("RECENTES");
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [erroCategorias, setErroCategorias] = useState("");

  const carregarCategorias = useCallback(async () => {
    setCarregandoCategorias(true);
    setErroCategorias("");
    try {
      setCategorias(await buscarCategorias());
    } catch (error) {
      setErroCategorias(error instanceof Error ? error.message : "Não foi possível carregar as atividades.");
    } finally {
      setCarregandoCategorias(false);
    }
  }, []);

  function abrirFiltro() {
    setCategoriaTemporaria(categoriaSelecionada);
    setOrdenacaoTemporaria(ordenacaoSelecionada);
    setFiltroAberto(true);
    if (categorias.length === 0 && !carregandoCategorias) void carregarCategorias();
  }

  return (
    <>
    <FlatList
      style={styles.list}
      key={colunas}
      numColumns={colunas}
      columnWrapperStyle={colunas === 2 ? styles.columns : undefined}
      contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 110 }]}
      data={lista.demandas}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <DemandaCard demanda={item} />}
      refreshControl={<RefreshControl refreshing={lista.atualizando} onRefresh={lista.atualizar} colors={["#0D3D8B"]} tintColor="#0D3D8B" />}
      ListHeaderComponent={
        <View style={styles.listHeading}>
          <View style={styles.listTitleRow}>
            <Text style={styles.heading}>{lista.carregando ? "Buscando publicações" : lista.erro ? "Publicações disponíveis" : `${lista.total} ${lista.total === 1 ? "demanda disponível" : "demandas disponíveis"}`}</Text>
            <TouchableOpacity
              style={[styles.filterButton, (categoriaSelecionada || ordenacaoSelecionada !== "RECENTES") && styles.filterButtonActive]}
              accessibilityRole="button"
              accessibilityLabel="Filtrar atividades e ordenar demandas por orçamento"
              onPress={abrirFiltro}
            >
              <MaterialIcons name="tune" size={17} color={categoriaSelecionada || ordenacaoSelecionada !== "RECENTES" ? "#fff" : "#0D3D8B"} />
              <Text style={[styles.filterButtonText, (categoriaSelecionada || ordenacaoSelecionada !== "RECENTES") && styles.filterButtonTextActive]}>Filtrar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stateText}>{`${categoriaSelecionada ? `Atividade: ${categoriaSelecionada.nome}` : "Todas as atividades"}. ${ordenacaoSelecionada === "RECENTES" ? "Mais recentes primeiro" : ordenacaoSelecionada === "MAIOR_ORCAMENTO" ? "Maior orçamento primeiro" : "Menor orçamento primeiro"}.`}</Text>
          {!!lista.erro && lista.demandas.length > 0 && <Text accessibilityRole="alert" style={styles.error}>{lista.erro} Puxe para atualizar.</Text>}
        </View>
      }
      ListEmptyComponent={<EstadoLista carregando={lista.carregando} erro={lista.erro} recarregar={lista.recarregar} categoria={categoriaSelecionada} limparFiltro={() => onSelecionarCategoria(null)} />}
      ListFooterComponent={lista.demandas.length > 0 ? (
        <View style={styles.footer}>
          {!!lista.erroMais && <Text accessibilityRole="alert" style={styles.error}>{lista.erroMais}</Text>}
          <Text style={styles.stateText}>{lista.demandas.length} de {lista.total} demandas</Text>
          {lista.temMais && <TouchableOpacity style={styles.button} disabled={lista.carregandoMais || lista.atualizando} accessibilityRole="button" onPress={lista.carregarMais}>
            {lista.carregandoMais ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{lista.erroMais ? "Tentar carregar mais" : "Carregar mais"}</Text>}
          </TouchableOpacity>}
        </View>
      ) : null}
    />
    <Modal visible={filtroAberto} transparent animationType="fade" onRequestClose={() => setFiltroAberto(false)}>
      <View style={styles.filterOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterTitle}>Filtrar demandas</Text>
            <TouchableOpacity onPress={() => setFiltroAberto(false)} accessibilityRole="button" accessibilityLabel="Fechar filtros">
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.filterDescription}>Escolha a atividade e a ordem dos orçamentos anunciados.</Text>
          <ScrollView style={styles.filterOptions} contentContainerStyle={styles.filterOptionsContent}>
            <Text style={styles.filterSectionTitle}>Atividade</Text>
            <TouchableOpacity
              style={[styles.filterOption, categoriaTemporaria === null && styles.filterOptionSelected]}
              onPress={() => setCategoriaTemporaria(null)}
              accessibilityRole="radio"
              accessibilityState={{ selected: categoriaTemporaria === null }}
            >
              <Text style={styles.filterOptionText}>Todas as atividades</Text>
              <MaterialIcons name={categoriaTemporaria === null ? "radio-button-checked" : "radio-button-unchecked"} size={22} color="#0D3D8B" />
            </TouchableOpacity>
            {carregandoCategorias ? <ActivityIndicator style={styles.filterLoading} color="#0D3D8B" /> : null}
            {erroCategorias ? (
              <View style={styles.filterFeedback}>
                <Text style={styles.error}>{erroCategorias}</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => void carregarCategorias()}>
                  <Text style={styles.clearFilterText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {!carregandoCategorias && !erroCategorias && categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={[styles.filterOption, categoriaTemporaria?.id === categoria.id && styles.filterOptionSelected]}
                onPress={() => setCategoriaTemporaria(categoria)}
                accessibilityRole="radio"
                accessibilityState={{ selected: categoriaTemporaria?.id === categoria.id }}
              >
                <Text style={styles.filterOptionText}>{categoria.nome}</Text>
                <MaterialIcons name={categoriaTemporaria?.id === categoria.id ? "radio-button-checked" : "radio-button-unchecked"} size={22} color="#0D3D8B" />
              </TouchableOpacity>
            ))}
            <Text style={styles.filterSectionTitle}>Ordenar por orçamento</Text>
            {opcoesOrdenacao.map((opcao) => (
              <TouchableOpacity
                key={opcao.valor}
                style={[styles.filterOption, ordenacaoTemporaria === opcao.valor && styles.filterOptionSelected]}
                onPress={() => setOrdenacaoTemporaria(opcao.valor)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ordenacaoTemporaria === opcao.valor }}
              >
                <Text style={styles.filterOptionText}>{opcao.titulo}</Text>
                <MaterialIcons name={ordenacaoTemporaria === opcao.valor ? "radio-button-checked" : "radio-button-unchecked"} size={22} color="#0D3D8B" />
              </TouchableOpacity>
            ))}
            <Text style={styles.filterHint}>Demandas com orçamento a combinar aparecem por último.</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.applyFilterButton}
            accessibilityRole="button"
            onPress={() => {
              onSelecionarCategoria(categoriaTemporaria);
              onSelecionarOrdenacao(ordenacaoTemporaria);
              setFiltroAberto(false);
            }}
          >
            <Text style={styles.buttonText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

export function DemandasDisponiveisPreview() {
  const lista = useDemandasDisponiveis(3);
  const router = useRouter();
  return (
    <View style={styles.preview}>
      <View style={styles.previewHeading}>
        <Text style={styles.heading}>Demandas disponíveis</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: "/professional-demands", params: { aba: "disponiveis" } } as Href)} style={styles.seeAll}>
          <Text style={styles.link}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.previewSubtitle}>Publicadas por clientes e abertas para prestadores</Text>
      {lista.demandas.map((demanda) => <DemandaCard key={demanda.id} demanda={demanda} />)}
      {lista.demandas.length === 0 && <EstadoLista carregando={lista.carregando} erro={lista.erro} recarregar={lista.recarregar} />}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { padding: 16, width: "100%", maxWidth: 1040, alignSelf: "center" },
  columns: { gap: 14 },
  listHeading: { marginBottom: 16, gap: 7 },
  listTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  heading: { fontSize: 19, fontWeight: "800", color: "#0F172A", flexShrink: 1 },
  filterButton: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "#0D3D8B", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  filterButtonActive: { backgroundColor: "#0D3D8B" },
  filterButtonText: { color: "#0D3D8B", fontSize: 13, fontWeight: "700" },
  filterButtonTextActive: { color: "#fff" },
  card: { flex: 1, padding: 18, borderRadius: 20, backgroundColor: "#fff", marginBottom: 14, borderWidth: 1, borderColor: "#E2E8F0", gap: 10 },
  tags: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  category: { color: "#0D3D8B", fontSize: 13, fontWeight: "700", flexShrink: 1 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "700", overflow: "hidden" },
  appliedBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "700", overflow: "hidden", color: "#0D3D8B", backgroundColor: "#E8EDFA" },
  title: { fontSize: 19, fontWeight: "800", color: "#0F172A" },
  description: { color: "#64748B", fontSize: 14, lineHeight: 21 },
  budget: { color: "#0D3D8B", fontSize: 17, fontWeight: "700" },
  infoRow: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  infoText: { flex: 1, color: "#64748B", fontSize: 13, lineHeight: 19 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexWrap: "wrap" },
  date: { flex: 1, color: "#64748B", fontSize: 12 },
  link: { color: "#0D3D8B", fontSize: 14, fontWeight: "700" },
  state: { backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", gap: 12 },
  stateTitle: { color: "#0F172A", fontSize: 18, fontWeight: "700", textAlign: "center" },
  stateText: { color: "#64748B", fontSize: 14, lineHeight: 21 },
  button: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12, backgroundColor: "#0D3D8B", alignItems: "center", minWidth: 140 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  footer: { alignItems: "center", gap: 12, paddingVertical: 16 },
  error: { color: "#B3261E", fontSize: 14, lineHeight: 20 },
  clearFilterText: { color: "#0D3D8B", fontSize: 14, fontWeight: "700" },
  filterOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.48)", alignItems: "center", justifyContent: "center", padding: 20 },
  filterModal: { width: "100%", maxWidth: 420, maxHeight: "80%", backgroundColor: "#fff", borderRadius: 22, padding: 20, gap: 12 },
  filterModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  filterTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: "#0F172A" },
  filterDescription: { color: "#64748B", fontSize: 14, lineHeight: 20 },
  filterOptions: { flexShrink: 1, maxHeight: 360 },
  filterOptionsContent: { gap: 8, paddingBottom: 4 },
  filterOption: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12 },
  filterOptionSelected: { borderColor: "#0D3D8B", backgroundColor: "#E8EDFA" },
  filterOptionText: { flex: 1, color: "#0F172A", fontSize: 14, fontWeight: "600" },
  filterSectionTitle: { color: "#0F172A", fontSize: 14, fontWeight: "800", marginTop: 6 },
  filterHint: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  filterLoading: { paddingVertical: 18 },
  filterFeedback: { gap: 8, padding: 8 },
  applyFilterButton: { minHeight: 48, borderRadius: 12, backgroundColor: "#0D3D8B", alignItems: "center", justifyContent: "center" },
  preview: { marginHorizontal: 20, marginTop: 24 },
  previewHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  previewSubtitle: { color: "#64748B", fontSize: 13, lineHeight: 19, marginBottom: 14 },
  seeAll: { paddingVertical: 14 },
});
