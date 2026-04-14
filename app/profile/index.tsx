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
import { ServiceCard } from "../../components/ui/service-card";
import { ReviewCard } from "../../components/ui/review-card";
import { SectionHeader } from "../../components/ui/section-header";
import { Button } from "../../components/ui/button";

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
            <Button 
              title="Contratar" 
              style={styles.actionButton} 
              onPress={() => {}} 
            />
            <Button 
              title="Mensagem" 
              variant="outline" 
              style={styles.actionButton} 
              onPress={() => {}} 
            />
          </View>
        </View>

        <SectionHeader 
          title="Serviços" 
          subtitle="a partir de R$ 90" 
          style={styles.servicesHeader} 
        />

        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}

        <Text style={styles.reviewTitle}>Avaliações recentes</Text>

        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} />
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
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 22,
  },
  actionButton: {
    flex: 1,
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
