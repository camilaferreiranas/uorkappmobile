import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const qualityTags = [
  "Pontualidade",
  "Comunicação",
  "Qualidade",
  "Custo-benefício",
];
const ratingLabels = ["Ruim", "Regular", "Bom", "Ótimo", "Incrível!"];

export default function ReviewScreen() {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Avaliação</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>RO</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Rafael Oliveira</Text>
            <Text style={styles.profileRole}>Eletricista Profissional</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Como você avalia o serviço?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setRating(value)}
              style={styles.starButton}
            >
              <MaterialIcons
                name={rating >= value ? "star" : "star-border"}
                size={42}
                color={rating >= value ? "#F39C12" : "#C4C4C4"}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating > 0 ? ratingLabels[rating - 1] : "Selecione uma nota"}
        </Text>

        <Text style={styles.sectionLabel}>Categorias de qualidade</Text>
        <View style={styles.tagRow}>
          {qualityTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selectedTags.includes(tag) && styles.tagActive,
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Comentário</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Compartilhe sua experiência (opcional)"
          placeholderTextColor="#A5A5A5"
          multiline
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Avaliação mútua</Text>
          <Text style={styles.bannerText}>
            Sua avaliação ajuda profissionais a crescer e garante mais confiança
            no marketplace.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled,
          ]}
          disabled={rating === 0}
        >
          <Text
            style={[
              styles.submitButtonText,
              rating === 0 && styles.submitButtonTextDisabled,
            ]}
          >
            Enviar avaliação
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E75A2B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileAvatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  profileRole: {
    fontSize: 14,
    color: "#7A7A95",
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  starButton: {
    padding: 6,
  },
  ratingLabel: {
    fontSize: 15,
    color: "#7A7A95",
    marginBottom: 20,
    textAlign: "center",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  tag: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginRight: 10,
    marginBottom: 10,
  },
  tagActive: {
    backgroundColor: "#E75A2B",
    borderColor: "#E75A2B",
  },
  tagText: {
    color: "#4A4A4A",
    fontSize: 13,
    fontWeight: "700",
  },
  tagTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 24,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: "top",
  },
  banner: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#E8F6EC",
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#227D41",
    marginBottom: 6,
  },
  bannerText: {
    color: "#3F6E52",
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#E75A2B",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#F0A38C",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  submitButtonTextDisabled: {
    color: "#FFFFFFCC",
  },
});
