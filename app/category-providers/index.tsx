import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ProfessionalCard } from "../../components/ui/professional-card";
import { Colors } from "../../constants/theme";
import { buscarPrestadoresCategoria, Prestador } from "../../services/prestadorService";
/*
const allProfessionals = [
  { name: "Rafael Oliveira", role: "Técnico em Eletrônica", rating: 4.9, distance: "1,2 km", initials: "RO", category: "Eletrônica" },
  { name: "Patrícia Silva", role: "Limpeza residencial", rating: 4.8, distance: "2,0 km", initials: "PS", category: "Limpeza" },
  { name: "Carlos Mendes", role: "Instalação elétrica", rating: 4.7, distance: "3,4 km", initials: "CM", category: "Eletrônica" },
  { name: "Ana Paula", role: "Pintura e reformas", rating: 4.6, distance: "4,8 km", initials: "AP", category: "Pintura" },
  { name: "João Ferreira", role: "Jardinagem e paisagismo", rating: 4.7, distance: "2,1 km", initials: "JF", category: "Jardinagem" },
  { name: "Lucas Souza", role: "Eletricista residencial", rating: 4.8, distance: "1,5 km", initials: "LS", category: "Eletrônica" },
  { name: "Fernanda Lima", role: "Faxineira profissional", rating: 4.9, distance: "3,0 km", initials: "FL", category: "Limpeza" },
  { name: "Roberto Alves", role: "Pintor e reformas", rating: 4.5, distance: "5,2 km", initials: "RA", category: "Pintura" },
  { name: "Sandra Melo", role: "Técnica em eletrônica", rating: 4.6, distance: "2,8 km", initials: "SM", category: "Eletrônica" },
  { name: "Pedro Costa", role: "Instalações hidráulicas", rating: 4.7, distance: "1,9 km", initials: "PC", category: "Instalação" },
  { name: "Beatriz Rocha", role: "Manicure e estética", rating: 4.9, distance: "0,8 km", initials: "BR", category: "Beleza" },
  { name: "Marcos Oliveira", role: "Reparo e manutenção geral", rating: 4.6, distance: "2,2 km", initials: "MO", category: "Reparo" },
  { name: "Camila Torres", role: "Limpeza pós-obra", rating: 4.8, distance: "3,5 km", initials: "CT", category: "Limpeza" },
  { name: "André Nascimento", role: "Serviços gerais", rating: 4.4, distance: "4,0 km", initials: "AN", category: "Serviços" },
];
*/
export default function CategoryProvidersScreen() {
  const router = useRouter();

  const { category, categoriaId } = useLocalSearchParams<{
    category: string;
    categoriaId: string;
  }>();

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPrestadores() {
      try {
        setCarregando(true);

        const dados = await buscarPrestadoresCategoria(Number(categoriaId));
        setPrestadores(dados);
      } catch (error) {
        console.log("Erro ao buscar prestadores:", error);
      } finally {
        setCarregando(false);
      }
    }

    if (categoriaId) {
      carregarPrestadores();
    }
  }, [categoriaId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{category}</Text>
          <Text style={styles.headerSubtitle}>{prestadores.length} profissionais disponíveis</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {prestadores.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={56} color="#C4C4C4" />
            <Text style={styles.emptyTitle}>Nenhum profissional encontrado</Text>
            <Text style={styles.emptyText}>
              Não há profissionais cadastrados nessa categoria ainda.
            </Text>
          </View>
        ) : (
          prestadores.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              style={styles.providerCard}
              name={professional.nome}
              role="Prestador de serviço"
              rating={0}
              distance="0 km"
              initials={professional.nome?.substring(0, 2).toUpperCase() || "US"}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#FFE5D9",
    fontSize: 13,
  },
  container: {
    paddingTop: 14,
    paddingBottom: 50,
    gap: 6,
  },
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
    color: "#8A8A8A",
    textAlign: "center",
    lineHeight: 20,
  },
});
