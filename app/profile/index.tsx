import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/ui/button";
import { SectionHeader } from "../../components/ui/section-header";
import { ServiceCard } from "../../components/ui/service-card";
import { Colors } from "../../constants/theme";
import { buscarPerfilPrestador, PerfilPrestador } from "../../services/prestadorService";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [profile, setProfile] = useState<PerfilPrestador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        setLoading(true);
        setError(null);
        const data = await buscarPerfilPrestador(Number(id));
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      carregarPerfil();
    }
  }, [id]);

  const openProposal = (serviceTitle?: string) => {
  router.push({
    pathname: "/send-proposal" as any,
    params: {
      prestadorId: id,
      professional: profile?.nome ?? "",
      service: serviceTitle ?? "",
    },
  });
};

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.errorText}>{error ?? "Não foi possível carregar o perfil"}</Text>
      </SafeAreaView>
    );
  }

  const initials = profile.nome?.substring(0, 2).toUpperCase() || "US";

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <MaterialIcons name="arrow-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cover}>
          <View style={styles.coverCircle} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.name}>{profile.nome}</Text>
          <Text style={styles.specialty}>{profile.descricao}</Text>
          <Text style={styles.location}>
            {profile.cidade} - {profile.estado}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{profile.percentualConclusao.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Conclusão</Text>
            </View>
            <View style={styles.statBlock}>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#FFB800" />
                <Text style={styles.ratingValue}>{profile.notaMedia.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{profile.totalAvaliacoes}</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
            </View>
          </View>

          <Button
            title="Contratar"
            style={styles.contractButton}
            onPress={() => openProposal()}
          />
        </View>

        <SectionHeader
          title="Serviços"
          subtitle={
            profile.servicos.length > 0
              ? `a partir de ${formatCurrency(
                  Math.min(...profile.servicos.map((s) => s.valorMedio))
                )}`
              : "Nenhum serviço cadastrado"
          }
          style={styles.servicesHeader}
        />

        {profile.servicos.map((service) => (
          <ServiceCard
            key={service.titulo}
            title={service.titulo}
            subtitle={service.descricao}
            price={formatCurrency(service.valorMedio)}
            rating={service.avaliacao}
            onPress={() => openProposal(service.titulo)}
          />
        ))}

        {profile.totalAvaliacoes > 0 && (
          <>
            <Text style={styles.reviewTitle}>Avaliações recentes</Text>
            {/* Quando existir endpoint de reviews, mapeie aqui com <ReviewCard /> */}
          </>
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 54,
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingBottom: 60,
  },
  cover: {
    height: 200,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  coverCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: -40,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#D94A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  detailsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.black,
  },
  specialty: {
    fontSize: 14,
    color: "#717171",
    marginTop: 6,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: "#8A8A8A",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 6,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.black,
  },
  statLabel: {
    marginTop: 6,
    color: "#8A8A8A",
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    color: Colors.black,
    fontWeight: "800",
    fontSize: 16,
  },
  contractButton: {
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
  },
  servicesHeader: {
    marginTop: 28,
  },
  reviewTitle: {
    marginTop: 26,
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
  },
});