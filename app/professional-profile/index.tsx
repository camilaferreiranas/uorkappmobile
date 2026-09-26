import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";
import { ProfileAvatar } from "../../components/ui/profile-avatar";
import { getInitials } from "../../utils/get-initials";
import {
  buscarMeuPerfilPrestador,
  type PerfilPrestador,
} from "../../services/prestadorService";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatPhone(phone: string | null) {
  if (!phone) return "Telefone não informado";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatLocation(profile: PerfilPrestador) {
  const cityState = [profile.cidade, profile.estado].filter(Boolean).join(" - ");
  return [profile.bairro, cityState].filter(Boolean).join(", ") || "Localização não informada";
}

const menuItems = [
  { icon: "edit", label: "Editar perfil" },
  { icon: "add-circle-outline", label: "Adicionar serviço" },
  { icon: "badge", label: "Certificações" },
  { icon: "notifications", label: "Notificações" },
  { icon: "help-outline", label: "Ajuda e suporte" },
];

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<PerfilPrestador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregarPerfil = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setProfile(await buscarMeuPerfilPrestador());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o perfil profissional."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregarPerfil();
    }, [carregarPerfil])
  );

  function handleMenuPress(label: string) {
    if (label === "Editar perfil") {
      router.push("/edit-profile");
      return;
    }

    if (label === "Notificações") {
      router.push("/professional-notifications");
    }
  }

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Carregando perfil profissional...</Text>
        </View>
        <ProfessionalNavBar active="perfil" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>
            {error || "Não foi possível carregar o perfil profissional."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void carregarPerfil()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
        <ProfessionalNavBar active="perfil" />
      </SafeAreaView>
    );
  }

  const nameParts = profile.nome.trim().split(/\s+/);
  const initials = getInitials(
    nameParts[0],
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : undefined
  );
  const specialty = profile.categorias.join(", ") || "Prestador de serviço";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ProfileAvatar
            imageUrl={profile.fotoPerfilUrl}
            initials={initials}
            size={80}
            backgroundColor="rgba(255,255,255,0.2)"
            borderColor="rgba(255,255,255,0.5)"
            borderWidth={3}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.nome}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={14} color={Colors.primaryLight} />
            <Text style={styles.location}>{formatLocation(profile)}</Text>
          </View>
          <View style={styles.memberBadge}>
            <MaterialIcons name="verified" size={14} color={Colors.warning} />
            <Text style={styles.memberText}>Membro desde {profile.dataCriacao}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <MaterialIcons name="star" size={16} color={Colors.warning} />
              <Text style={styles.statValue}>{(profile.notaMedia ?? 0).toFixed(1)}</Text>
            </View>
            <Text style={styles.statLabel}>{profile.totalAvaliacoes ?? 0} avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(profile.percentualConclusao ?? 0).toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>Conclusão</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(profile.totalGanho ?? 0)}</Text>
            <Text style={styles.statLabel}>Total ganho</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={18} color={Colors.primary} />
            <Text style={styles.contactText}>{formatPhone(profile.telefone)}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={18} color={Colors.primary} />
            <Text style={styles.contactText}>{profile.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitleStandalone}>Serviços oferecidos</Text>

        {profile.servicos.length === 0 ? (
          <View style={styles.emptyServicesCard}>
            <Text style={styles.stateText}>Nenhum serviço cadastrado.</Text>
          </View>
        ) : profile.servicos.map((service) => (
          <View key={service.titulo} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{service.titulo}</Text>
              <Text style={styles.serviceSubtitle}>{service.descricao}</Text>
            </View>
            <View style={styles.serviceRight}>
              <Text style={styles.servicePrice}>{formatCurrency(service.valorMedio ?? 0)}</Text>
              <View style={styles.serviceRating}>
                <MaterialIcons name="star" size={12} color={Colors.warning} />
                <Text style={styles.serviceRatingText}>
                  {(service.avaliacao ?? 0).toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={() => handleMenuPress(item.label)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrapper}>
                <MaterialIcons name={item.icon as any} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ProfessionalNavBar active="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingBottom: 110,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 30,
    paddingBottom: 90,
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: { color: Colors.white, fontWeight: "700" },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: "center",
  },
  avatar: {
    marginBottom: 12,
  },
  name: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  specialty: {
    color: Colors.primaryLight,
    fontSize: 14,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  location: {
    color: Colors.primaryLight,
    fontSize: 13,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  memberText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.background,
    marginVertical: 4,
  },
  contactCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
  },
  sectionTitleStandalone: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyServicesCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    marginBottom: 3,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  serviceRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },
  serviceRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  serviceRatingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});
