import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ProfileAvatar } from "../../components/ui/profile-avatar";
import { ProfileScreenHeader } from "../../components/ui/profile-screen-header";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../contexts/auth-context";
import { getInitials } from "../../utils/get-initials";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function getPhotoContentType(
  asset: ImagePicker.ImagePickerAsset
): "image/jpeg" | "image/png" | "image/webp" | null {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp") {
    return mimeType;
  }

  const extension = asset.fileName?.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, updatePhoto, removePhoto, logout } = useAuth();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"CPF" | "CNPJ">("CPF");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!user) return;
    setNome(user.nome ?? "");
    setSobrenome(user.sobrenome ?? "");
    setEmail(user.email ?? "");
    setTipoPessoa(user.tipoPessoa ?? "CPF");
    setDocumento(user.documento ?? "");
    setTelefone(user.telefone ?? "");
  }, [user]);

  const formError = useMemo(() => {
    if (!nome.trim()) return "Informe o nome.";
    if (!sobrenome.trim()) return "Informe o sobrenome.";
    if (!emailRegex.test(email.trim())) return "Informe um e-mail válido.";
    if (!documento.trim()) return `Informe o ${tipoPessoa}.`;
    if (senha && senha.length < 8) return "A nova senha deve ter ao menos 8 caracteres.";
    if (senha !== confirmacaoSenha) return "As senhas não coincidem.";
    return "";
  }, [confirmacaoSenha, documento, email, nome, senha, sobrenome, tipoPessoa]);

  function handleTipoPessoaChange(type: "CPF" | "CNPJ") {
    setTipoPessoa(type);
    setDocumento((current) => current.replace(/\D/g, "").slice(0, type === "CPF" ? 11 : 14));
  }

  function handleDocumentoChange(value: string) {
    const maxLength = tipoPessoa === "CPF" ? 11 : 14;
    setDocumento(value.replace(/\D/g, "").slice(0, maxLength));
  }

  async function handleChoosePhoto() {
    setSubmitError("");

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Autorize o acesso às suas fotos para escolher uma imagem de perfil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const contentType = getPhotoContentType(asset);
      if (!contentType) {
        throw new Error("Escolha uma imagem JPEG, PNG ou WebP.");
      }

      setPhotoLoading(true);
      const size = asset.fileSize ?? (await (await fetch(asset.uri)).blob()).size;
      if (size <= 0 || size > MAX_PHOTO_SIZE) {
        throw new Error("A imagem deve ter no máximo 5 MB.");
      }

      await updatePhoto({ uri: asset.uri, contentType, size });
      Alert.alert("Foto atualizada", "Sua nova foto de perfil foi salva.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível atualizar a foto."
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  function handleRemovePhoto() {
    Alert.alert("Remover foto", "Deseja remover sua foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            setPhotoLoading(true);
            setSubmitError("");
            await removePhoto();
          } catch (error) {
            setSubmitError(
              error instanceof Error ? error.message : "Não foi possível remover a foto."
            );
          } finally {
            setPhotoLoading(false);
          }
        },
      },
    ]);
  }

  async function handleSave() {
    if (formError || !user) return;

    setLoading(true);
    setSubmitError("");

    try {
      const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();

      await updateProfile({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        tipoPessoa,
        documento: documento.trim(),
        telefone: telefone.trim(),
        ...(senha ? { senha } : {}),
      });

      if (emailChanged) {
        await logout();
        Alert.alert(
          "Perfil atualizado",
          "Como o e-mail foi alterado, entre novamente com o novo e-mail."
        );
        router.replace("/login");
        return;
      }

      Alert.alert("Perfil atualizado", "Suas informações foram salvas.");
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível atualizar o perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ProfileScreenHeader title="Editar perfil" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => void handleChoosePhoto()}
            disabled={photoLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={user?.fotoPerfilUrl ? "Alterar foto de perfil" : "Adicionar foto de perfil"}
          >
            <ProfileAvatar
              imageUrl={user?.fotoPerfilUrl}
              initials={getInitials(user?.nome, user?.sobrenome)}
              size={104}
              backgroundColor={Colors.primary}
              borderColor={Colors.white}
              borderWidth={3}
            />
            <View style={styles.cameraBadge}>
              {photoLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <MaterialIcons name="photo-camera" size={20} color={Colors.white} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.photoTitle}>
            {user?.fotoPerfilUrl ? "Alterar foto" : "Adicionar foto"}
          </Text>
          <Text style={styles.photoHelper}>JPEG, PNG ou WebP de até 5 MB</Text>
          {user?.fotoPerfilUrl ? (
            <TouchableOpacity
              onPress={handleRemovePhoto}
              disabled={photoLoading}
              accessibilityRole="button"
            >
              <Text style={styles.removePhotoText}>Remover foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.description}>
          Atualize suas informações pessoais. O endereço é alterado separadamente.
        </Text>

        <View style={styles.card}>
          <Input
            label="Nome"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label="Sobrenome"
            value={sobrenome}
            onChangeText={setSobrenome}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.fieldLabel}>Tipo de pessoa</Text>
          <View style={styles.typeSelector}>
            {(["CPF", "CNPJ"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeOption, tipoPessoa === type && styles.typeOptionSelected]}
                onPress={() => handleTipoPessoaChange(type)}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    tipoPessoa === type && styles.typeOptionTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={tipoPessoa}
            value={documento}
            onChangeText={handleDocumentoChange}
            keyboardType="numeric"
            placeholder={`Digite o ${tipoPessoa}`}
            maxLength={tipoPessoa === "CPF" ? 11 : 14}
          />
          <Input
            label="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="Digite seu telefone"
          />
          <Input
            label="Nova senha (opcional)"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="Mínimo de 8 caracteres"
            textContentType="newPassword"
          />
          <Input
            label="Confirmar nova senha"
            value={confirmacaoSenha}
            onChangeText={setConfirmacaoSenha}
            secureTextEntry
            placeholder="Repita a nova senha"
            textContentType="newPassword"
          />

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

          <Button
            title="Salvar alterações"
            onPress={handleSave}
            loading={loading}
            disabled={!!formError || !user || photoLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoButton: {
    position: "relative",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  photoTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 11,
  },
  photoHelper: {
    color: "#737373",
    fontSize: 12,
    marginTop: 4,
  },
  removePhotoText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 9,
  },
  description: {
    color: "#737373",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  fieldLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
  },
  typeOptionText: {
    color: "#777",
    fontWeight: "700",
  },
  typeOptionTextSelected: {
    color: Colors.white,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 4,
  },
});
