import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PillGroup } from "../../components/ui/pill-group";
import { ScreenContainer } from "../../components/ui/screen-container";
import { ScreenHeader } from "../../components/ui/screen-header";
import { Select } from "../../components/ui/select";
import { Colors, Radii } from "../../constants/theme";

const categories = [
  "Eletrônica",
  "Limpeza",
  "Construção",
  "Beleza",
  "Pintura",
  "Jardinagem",
];
const urgencies = ["Normal", "Urgente", "Hoje"];

export default function PublishDemandScreen() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [budget, setBudget] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const missing = useMemo(() => {
    const fields: string[] = [];
    if (!category) fields.push("categoria");
    if (title.trim().length < 5) fields.push("título");
    if (description.trim().length < 15) fields.push("descrição");
    if (!location.trim()) fields.push("localização");
    return fields;
  }, [category, title, description, location]);

  const addPhoto = () => {
    if (photos.length >= 4) return;
    setPhotos((current) => [...current, `Foto ${current.length + 1}`]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Publicar demanda" onBack={() => router.back()} />
      <Text style={styles.pageDescription}>
        Descreva o serviço que você precisa e receba propostas de profissionais.
      </Text>

      <Text style={styles.groupLabel}>Sobre o serviço</Text>
      <Select
        label="Categoria"
        value={category}
        options={categories}
        placeholder="Selecione a categoria"
        onSelect={setCategory}
      />
      <Input
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Ex: Troca de lâmpadas e reparos elétricos"
        maxLength={60}
        hint={`${title.length}/60 caracteres`}
      />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva com detalhes o serviço que você precisa"
        multiline
        numberOfLines={6}
        style={styles.textArea}
      />

      <Text style={styles.groupLabel}>Local e prazo</Text>
      <Input
        label="Localização"
        value={location}
        onChangeText={setLocation}
        placeholder="CEP ou ponto de referência"
      />
      <Button
        title="Usar localização atual"
        variant="outline"
        onPress={() => {}}
        style={styles.inlineButton}
        textStyle={styles.inlineButtonText}
      />
      <View style={styles.spacer} />
      <PillGroup
        label="Urgência"
        options={urgencies}
        value={urgency}
        onSelect={setUrgency}
      />

      <Text style={styles.groupLabel}>Orçamento e fotos</Text>
      <Input
        label="Orçamento estimado (opcional)"
        value={budget}
        onChangeText={setBudget}
        placeholder="R$ 0,00"
        keyboardType="numeric"
        hint="Deixe em branco para receber propostas com valores dos profissionais."
      />

      <Text style={styles.label}>Fotos (opcional)</Text>
      <View style={styles.photosRow}>
        {photos.length > 0 ? (
          photos.map((photo) => (
            <View key={photo} style={styles.photoThumb}>
              <Text style={styles.photoText}>{photo}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.photoHint}>
            Adicione até 4 fotos para explicar melhor sua demanda.
          </Text>
        )}
      </View>
      <Button
        title="Adicionar foto"
        variant="outline"
        onPress={addPhoto}
        disabled={photos.length >= 4}
        disabledReason="Você já adicionou o máximo de 4 fotos."
        style={styles.photoButton}
      />

      <Button
        title="Publicar demanda"
        onPress={() => router.replace("/proposals")}
        disabled={missing.length > 0}
        disabledReason={
          missing.length > 0
            ? `Preencha ${missing.join(", ")} para publicar.`
            : undefined
        }
        style={styles.publishButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageDescription: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 24,
    marginTop: -8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 10,
  },
  textArea: {
    minHeight: 130,
    textAlignVertical: "top",
  },
  inlineButton: {
    alignSelf: "flex-start",
    width: "auto",
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  inlineButtonText: {
    fontSize: 14,
  },
  spacer: {
    height: 16,
  },
  photosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  photoThumb: {
    width: 74,
    height: 74,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceNeutral,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoText: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 12,
  },
  photoHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  photoButton: {
    marginBottom: 8,
  },
  publishButton: {
    marginTop: 24,
  },
});
