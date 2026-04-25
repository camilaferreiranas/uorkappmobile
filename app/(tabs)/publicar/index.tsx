import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/theme";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { Select } from "../../../components/ui/select";
import { PillGroup } from "../../../components/ui/pill-group";

const categories = [
  "Eletrônica",
  "Limpeza",
  "Construção",
  "Beleza",
  "Pintura",
  "Jardinagem",
];
const urgencies = ["Normal", "Urgente", "Hoje"];

export default function PublicarScreen() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [budget, setBudget] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const addPhoto = () => {
    if (photos.length >= 4) return;
    setPhotos((current) => [...current, `Foto ${current.length + 1}`]);
  };

  return (
    <ScreenContainer backgroundColor="#F7F7F7">
      <Text style={styles.pageTitle}>Publicar demanda</Text>
      <Text style={styles.pageDescription}>
        Descreva o serviço que você precisa e encontre o profissional ideal.
      </Text>

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
        style={styles.whiteInput}
      />

      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva com detalhes o serviço que você precisa"
        multiline
        numberOfLines={6}
        style={[styles.whiteInput, styles.textArea]}
      />

      <View style={styles.fieldGroup}>
        <Input
          label="Localização"
          value={location}
          onChangeText={setLocation}
          placeholder="CEP ou ponto de referência"
          style={styles.whiteInput}
        />
        <Button
          title="Usar localização atual"
          onPress={() => {}}
          style={styles.gpsButton}
          textStyle={styles.gpsButtonText}
        />
      </View>

      <PillGroup
        label="Urgência"
        options={urgencies}
        value={urgency}
        onSelect={setUrgency}
      />

      <Input
        label="Orçamento estimado (opcional)"
        value={budget}
        onChangeText={setBudget}
        placeholder="R$ 0,00"
        keyboardType="numeric"
        style={styles.whiteInput}
      />

      <View style={styles.fieldGroup}>
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
          style={styles.photoButton}
        />
      </View>

      <Button
        title="Publicar demanda"
        onPress={() => {}}
        style={styles.publishButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 8,
  },
  pageDescription: {
    color: "#6B6B6B",
    fontSize: 14,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "700",
    marginBottom: 10,
  },
  whiteInput: {
    backgroundColor: Colors.white,
    borderColor: "#E5E5E5",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  gpsButton: {
    marginTop: -8,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    width: "auto",
  },
  gpsButtonText: {
    fontSize: 14,
  },
  photosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoThumb: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  photoText: {
    color: "#8A8A8A",
    textAlign: "center",
    fontSize: 12,
  },
  photoHint: {
    color: "#8A8A8A",
    fontSize: 13,
  },
  photoButton: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  publishButton: {
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 18,
  },
});
