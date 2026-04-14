import { MaterialIcons } from "@expo/vector-icons";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const services = [
  {
    title: "Instalação elétrica",
    price: "R$ 150",
    subtitle: "Tomada e painel",
    rating: 4.9,
  },
  {
    title: "Troca de lâmpadas",
    price: "R$ 90",
    subtitle: "Residencial e comercial",
    rating: 4.7,
  },
  {
    title: "Laudo técnico",
    price: "R$ 250",
    subtitle: "Inspeção completa",
    rating: 4.8,
  },
];

const reviews = [
  {
    name: "Mariana Costa",
    comment: "Excelente trabalho e rapidez na entrega. Recomendo!",
    rating: 5.0,
    distance: "1.0 km",
  },
  {
    name: "Felipe Alves",
    comment: "Muito profissional e demonstrou conhecimento técnico.",
    rating: 4.8,
    distance: "3.2 km",
  },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cover}>
          <View style={styles.coverCircle} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RO</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.name}>Rafael Oliveira</Text>
          <Text style={styles.specialty}>Técnico em Eletrônica</Text>
          <Text style={styles.location}>Barra, Salvador - BA</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Conclusão</Text>
            </View>
            <View style={styles.statBlock}>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#FFB800" />
                <Text style={styles.ratingValue}>4.9</Text>
              </View>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>120</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Contratar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Mensagem</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <Text style={styles.sectionSubtitle}>a partir de R$ 90</Text>
        </View>

        {services.map((service) => (
          <View key={service.title} style={styles.serviceCard}>
            <View style={styles.serviceText}>
              <Text style={styles.serviceName}>{service.title}</Text>
              <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
            </View>
            <View style={styles.servicePriceContainer}>
              <Text style={styles.servicePrice}>{service.price}</Text>
              <View style={styles.serviceRatingBadge}>
                <MaterialIcons name="star" size={14} color="#FFB800" />
                <Text style={styles.serviceRatingText}>
                  {service.rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.reviewTitle}>Avaliações recentes</Text>

        {reviews.map((review) => (
          <View key={review.name} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>
                  {review.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewDistance}>{review.distance}</Text>
              </View>
              <View style={styles.reviewRatingBadge}>
                <MaterialIcons name="star" size={14} color="#FFB800" />
                <Text style={styles.reviewRatingText}>
                  {review.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    paddingBottom: 50,
  },
  cover: {
    height: 180,
    backgroundColor: "#E75A2B",
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
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
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
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
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
    color: "#111",
    fontWeight: "800",
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 22,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#E75A2B",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E75A2B",
  },
  secondaryButtonText: {
    color: "#E75A2B",
    fontWeight: "700",
    fontSize: 15,
  },
  sectionHeader: {
    marginTop: 28,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#E75A2B",
    fontWeight: "700",
  },
  serviceCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  serviceText: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: "#7A7A7A",
  },
  servicePriceContainer: {
    alignItems: "flex-end",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  serviceRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF4E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceRatingText: {
    color: "#BF6B00",
    fontWeight: "700",
    fontSize: 13,
  },
  reviewTitle: {
    marginTop: 26,
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  reviewCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E75A2B",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    color: "#fff",
    fontWeight: "800",
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  reviewDistance: {
    fontSize: 12,
    color: "#8A8A8A",
  },
  reviewRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF4E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reviewRatingText: {
    color: "#BF6B00",
    fontWeight: "700",
    fontSize: 13,
  },
  reviewComment: {
    fontSize: 14,
    color: "#6B6B6B",
    lineHeight: 20,
  },
});
