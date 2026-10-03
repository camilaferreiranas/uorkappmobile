import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/ui/button";
import { ProfileAvatar } from "../../components/ui/profile-avatar";
import { ScreenHeader } from "../../components/ui/screen-header";
import { SectionHeader } from "../../components/ui/section-header";
import { ServiceCard } from "../../components/ui/service-card";
import { Colors, Radii, Shadow, Spacing } from "../../constants/theme";
import { buscarPerfilPrestador, type PerfilPrestador } from "../../services/prestadorService";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProfileScreen() {
  const { id, modo } = useLocalSearchParams<{ id: string; modo?: string }>();
  const somenteConsulta = modo === "candidatura";

  return <ProfileContent id={id} somenteConsulta={somenteConsulta} />;
}

function ProfileContent({ id, somenteConsulta }: { id?: string; somenteConsulta?: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<PerfilPrestador | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;
    buscarPerfilPrestador(Number(id))
      .then((data) => { if (active) setProfile(data); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Erro ao carregar perfil"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const openProposal = (serviceTitle?: string) => {
    router.push({
      pathname: "/send-proposal" as any,
      params: {
        prestadorId: id,
        professional: profile?.nome ?? "",
        service: serviceTitle ?? "",
        serviceOptions: JSON.stringify(
          profile?.servicos.map((item) => item.titulo) ?? []
        ),
      },
    });
  };

  if (loading || error || !profile) {
    return <SafeAreaView style={styles.safeArea}>
      <ScreenHeader onBack={() => router.back()} />
      {loading ? <ActivityIndicator size="large" color={Colors.brandPrimary} /> : <Text style={styles.specialty}>{error}</Text>}
    </SafeAreaView>;
  }

  const initials = profile.nome?.substring(0, 2).toUpperCase() || "US";
  const startingPrice = profile.servicos.length > 0
    ? formatCurrency(Math.min(...profile.servicos.map((service) => service.valorMedio)))
    : "Sob consulta";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          onBack={() => router.back()}
          actionIcon="ios-share"
          actionLabel="Compartilhar"
        />

        <View style={styles.avatarContainer}>
          <ProfileAvatar
            imageUrl={profile.fotoPerfilUrl}
            initials={initials}
            size={90}
            backgroundColor={Colors.primary}
            borderColor={Colors.white}
            borderWidth={4}
          />
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
                <MaterialIcons name="star" size={16} color={Colors.warning} />
                <Text style={styles.ratingValue}>{profile.notaMedia.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{profile.totalAvaliacoes}</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
            </View>
          </View>

          {!somenteConsulta && (
            <Button
              title="Contratar"
              style={styles.contractButton}
              onPress={() => openProposal()}
            />
          )}
        </View>

        <Button
          title="Enviar mensagem"
          variant="outline"
          onPress={() => {}}
          style={styles.messageButton}
        />

        <SectionHeader
          title="Serviços"
          subtitle="Orçamento fechado antes de contratar"
          style={styles.section}
        />

        {profile.servicos.map((service) => (
          <ServiceCard
            key={service.titulo}
            title={service.titulo}
            subtitle={service.descricao}
            price={formatCurrency(service.valorMedio)}
            rating={service.avaliacao}
            onPress={somenteConsulta ? undefined : () => openProposal(service.titulo)}
          />
        ))}
      </ScrollView>

      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>A partir de</Text>
          <Text style={styles.ctaValue}>{startingPrice}</Text>
        </View>
        <View style={styles.ctaButton}>
          <Button title="Contratar" onPress={() => openProposal()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.sectionTight,
    paddingBottom: 150,
  },
  identity: {
    alignItems: "center",
    gap: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 8,
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
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  specialty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceNeutral,
    borderRadius: Radii.lg,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  statLabel: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
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
  messageButton: {
    marginBottom: 4,
  },
  section: {
    marginTop: 24,
  },
  ctaBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.pill,
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    ...Shadow.floating,
  },
  ctaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ctaValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  ctaButton: {
    flex: 1,
    maxWidth: 200,
  },
});
