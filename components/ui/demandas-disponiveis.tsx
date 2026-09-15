import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDemandasDisponiveis } from "../../hooks/use-demandas-disponiveis";
import { type DemandaDisponivel } from "../../services/demandaService";

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

function EstadoLista({ carregando, erro, recarregar }: { carregando: boolean; erro: string; recarregar: () => void }) {
  return (
    <View style={styles.state}>
      {carregando ? <ActivityIndicator color="#0D3D8B" size="large" /> : <MaterialIcons name={erro ? "error-outline" : "assignment"} size={36} color="#0D3D8B" />}
      <Text style={styles.stateTitle}>{carregando ? "Carregando demandas..." : erro ? "Não foi possível carregar" : "Nenhuma demanda disponível"}</Text>
      {!carregando && <Text style={styles.stateText}>{erro || "As demandas abertas de outros clientes aparecerão aqui. Suas próprias publicações não são exibidas."}</Text>}
      {!carregando && <TouchableOpacity style={styles.button} accessibilityRole="button" onPress={recarregar}><Text style={styles.buttonText}>{erro ? "Tentar novamente" : "Atualizar"}</Text></TouchableOpacity>}
    </View>
  );
}

export function DemandasDisponiveisLista() {
  const lista = useDemandasDisponiveis();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colunas = width >= 700 ? 2 : 1;
  return (
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
          <Text style={styles.heading}>{lista.carregando ? "Buscando publicações" : lista.erro ? "Publicações disponíveis" : `${lista.total} ${lista.total === 1 ? "demanda disponível" : "demandas disponíveis"}`}</Text>
          <Text style={styles.stateText}>Todas as publicações abertas de outros clientes, da mais recente para a mais antiga.</Text>
          {!!lista.erro && lista.demandas.length > 0 && <Text accessibilityRole="alert" style={styles.error}>{lista.erro} Puxe para atualizar.</Text>}
        </View>
      }
      ListEmptyComponent={<EstadoLista carregando={lista.carregando} erro={lista.erro} recarregar={lista.recarregar} />}
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
  heading: { fontSize: 19, fontWeight: "800", color: "#0F172A", flexShrink: 1 },
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
  preview: { marginHorizontal: 20, marginTop: 24 },
  previewHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  previewSubtitle: { color: "#64748B", fontSize: 13, lineHeight: 19, marginBottom: 14 },
  seeAll: { paddingVertical: 14 },
});
