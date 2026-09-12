import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { Card } from "../../components/ui/card";
import { StarRating } from "../../components/ui/star-rating";
import { PillGroup } from "../../components/ui/pill-group";
import { avaliarPrestador } from "../../services/propostaService";

const qualityTags = [
  "Pontualidade",
  "Comunicação",
  "Qualidade",
  "Custo-benefício",
];

export default function ReviewScreen() {
  const router = useRouter();
  const { professional, propostaId } = useLocalSearchParams<{
    professional?: string;
    propostaId?: string;
  }>();
  const professionalName = professional?.trim() || "Prestador";
  const partesNome = professionalName.split(/\s+/);
  const initials = `${partesNome[0]?.[0] ?? "P"}${
    partesNome.length > 1 ? partesNome.at(-1)?.[0] ?? "" : ""
  }`.toUpperCase();
  const [rating, setRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");
  const [comment, setComment] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviarAvaliacao() {
    const id = Number(propostaId);
    if (!Number.isInteger(id) || id <= 0) {
      setErro("Não foi possível identificar o serviço avaliado.");
      return;
    }

    setEnviando(true);
    setErro("");
    try {
      await avaliarPrestador(id, {
        nota: rating,
        destaque: selectedTag || null,
        comentario: comment.trim() || null,
      });

      Alert.alert(
        "Avaliação enviada!",
        "Obrigado por compartilhar sua experiência.",
        [{ text: "Voltar ao histórico", onPress: () => router.back() }]
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a avaliação."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScreenContainer backgroundColor="#F7F7F7">
      <View style={styles.pageHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back" size={23} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Avaliação</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <Card style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{professionalName}</Text>
          <Text style={styles.profileRole}>Prestador de serviço</Text>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Como você avalia o serviço?</Text>
      <StarRating rating={rating} onRatingChange={setRating} />

      <Text style={styles.sectionLabel}>O que se destacou?</Text>
      <PillGroup 
        options={qualityTags} 
        value={selectedTag} 
        onSelect={setSelectedTag} 
      />

      <Input
        label="Comentário"
        value={comment}
        onChangeText={setComment}
        placeholder="Compartilhe sua experiência (opcional)"
        multiline
        maxLength={500}
        editable={!enviando}
        style={[styles.whiteInput, styles.textArea]}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Avaliação mútua</Text>
        <Text style={styles.bannerText}>
          Sua avaliação ajuda profissionais a crescer e garante mais confiança
          no marketplace.
        </Text>
      </View>

      {erro ? <Text style={styles.submitError}>{erro}</Text> : null}

      <Button
        title="Enviar avaliação"
        loading={enviando}
        disabled={rating === 0 || enviando}
        onPress={() => void enviarAvaliacao()}
        style={styles.submitButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: { width: 42 },
  pageTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.black,
    textAlign: "center",
  },
  profileCard: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileAvatarText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.black,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
  },
  whiteInput: {
    backgroundColor: Colors.white,
    borderColor: "#E5E5E5",
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
    borderRadius: 18,
    paddingVertical: 18,
  },
  submitError: {
    color: Colors.error,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
});
