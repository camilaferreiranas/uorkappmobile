import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../contexts/auth-context";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"CPF" | "CNPJ">("CPF");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [loading, setLoading] = useState(false);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            disabled={!!formError || !user}
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
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 42,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  content: {
    padding: 20,
    paddingBottom: 48,
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
