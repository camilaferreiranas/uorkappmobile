import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { PillGroup } from "../../components/ui/pill-group";
import { ScreenContainer } from "../../components/ui/screen-container";
import { ScreenHeader } from "../../components/ui/screen-header";
import { StarRating } from "../../components/ui/star-rating";
import { Colors, Radii } from "../../constants/theme";

const qualityTags = ["Pontualidade", "Comunicação", "Qualidade", "Custo-benefício"];

export default function ReviewScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");
  const [comment, setComment] = useState("");

  return (
    <ScreenContainer>
      <ScreenHeader title="Avaliação" onBack={() => router.back()} />

      <Card style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>RO</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Rafael Oliveira</Text>
          <Text style={styles.profileRole}>Eletricista profissional</Text>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Como você avalia o serviço?</Text>
      <StarRating rating={rating} onRatingChange={setRating} />

      <Text style={styles.sectionLabel}>O que se destacou?</Text>
      <PillGroup options={qualityTags} value={selectedTag} onSelect={setSelectedTag} />

      <Input
        label="Comentário (opcional)"
        value={comment}
        onChangeText={setComment}
        placeholder="Compartilhe sua experiência"
        multiline
        style={styles.textArea}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Avaliação mútua</Text>
        <Text style={styles.bannerText}>
          Sua avaliação ajuda profissionais a crescer e garante mais confiança no
          marketplace.
        </Text>
      </View>

      <Button
        title="Enviar avaliação"
        disabled={rating === 0}
        disabledReason="Toque nas estrelas para dar uma nota antes de enviar."
        onPress={() => {}}
        style={styles.submitButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileAvatarText: {
    color: Colors.textOnBrand,
    fontSize: 24,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.brandDark,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 130,
    textAlignVertical: "top",
  },
  banner: {
    padding: 16,
    borderRadius: Radii.lg,
    backgroundColor: Colors.brandTint,
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.brandDark,
    marginBottom: 6,
  },
  bannerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 4,
  },
});
