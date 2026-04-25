import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { ProfessionalNavBar } from "../../components/ui/professional-nav-bar";

const professional = {
  name: "Rafael Oliveira",
  specialty: "Técnico em Eletrônica",
  location: "Barra, Salvador - BA",
  phone: "(71) 99876-5432",
  email: "rafael.oliveira@email.com",
  memberSince: "Março de 2023",
  rating: 4.9,
  totalRatings: 120,
  completionRate: 98,
  totalEarned: "R$ 8.240",
};

const services = [
  { title: "Instalação elétrica", price: "R$ 150", subtitle: "Tomada e painel", rating: 4.9 },
  { title: "Troca de lâmpadas", price: "R$ 90", subtitle: "Residencial e comercial", rating: 4.7 },
  { title: "Laudo técnico", price: "R$ 250", subtitle: "Inspeção completa", rating: 4.8 },
];

const recentReviews = [
  { name: "Mariana Costa", comment: "Serviço impecável, pontual e muito atencioso.", rating: 5.0, date: "2 dias atrás" },
  { name: "Felipe Alves", comment: "Muito profissional e conhecimento técnico.", rating: 4.8, date: "1 semana atrás" },
  { name: "Beatriz Rocha", comment: "Resolveu o problema rapidamente. Recomendo!", rating: 5.0, date: "2 semanas atrás" },
];

const menuItems = [
  { icon: "edit", label: "Editar perfil" },
  { icon: "add-circle-outline", label: "Adicionar serviço" },
  { icon: "badge", label: "Certificações" },
  { icon: "notifications", label: "Notificações" },
  { icon: "help-outline", label: "Ajuda e suporte" },
];

export default function ProfessionalProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RO</Text>
          </View>
          <Text style={styles.name}>{professional.name}</Text>
          <Text style={styles.specialty}>{professional.specialty}</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={14} color="#FFE5D9" />
            <Text style={styles.location}>{professional.location}</Text>
          </View>
          <View style={styles.memberBadge}>
            <MaterialIcons name="verified" size={14} color="#FFD700" />
            <Text style={styles.memberText}>Membro desde {professional.memberSince}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <MaterialIcons name="star" size={16} color="#FFB800" />
              <Text style={styles.statValue}>{professional.rating}</Text>
            </View>
            <Text style={styles.statLabel}>{professional.totalRatings} avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{professional.completionRate}%</Text>
            <Text style={styles.statLabel}>Conclusão</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{professional.totalEarned}</Text>
            <Text style={styles.statLabel}>Total ganho</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={18} color={Colors.primary} />
            <Text style={styles.contactText}>{professional.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={18} color={Colors.primary} />
            <Text style={styles.contactText}>{professional.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitleStandalone}>Serviços oferecidos</Text>

        {services.map((service) => (
          <View key={service.title} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
            </View>
            <View style={styles.serviceRight}>
              <Text style={styles.servicePrice}>{service.price}</Text>
              <View style={styles.serviceRating}>
                <MaterialIcons name="star" size={12} color="#FFB800" />
                <Text style={styles.serviceRatingText}>{service.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitleStandalone}>Avaliações recentes</Text>

        {recentReviews.map((review) => (
          <View key={review.name} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>
                  {review.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </Text>
              </View>
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.reviewRating}>
                <MaterialIcons name="star" size={14} color="#FFB800" />
                <Text style={styles.reviewRatingText}>{review.rating.toFixed(1)}</Text>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrapper}>
                <MaterialIcons name={item.icon as any} size={18} color="#0D3D8B" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color="#C4C4C4" />
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
    backgroundColor: "#F2F4FB",
  },
  container: {
    paddingBottom: 110,
  },
  header: {
    backgroundColor: "#0D3D8B",
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  specialty: {
    color: "#B8CCF6",
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
    color: "#FFE5D9",
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
    color: "#D1E0FF",
    fontSize: 12,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: "#fff",
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
    color: "#8A8A8A",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 4,
  },
  contactCard: {
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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
    color: "#8A8A8A",
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
    color: "#8A8A8A",
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8EDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0D3D8B",
  },
  reviewMeta: {
    flex: 1,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: "#8A8A8A",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  reviewRatingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  reviewComment: {
    fontSize: 13,
    color: "#505050",
    lineHeight: 18,
  },
  menuCard: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#F5F5F5",
  },
  menuIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E8EDFA",
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
