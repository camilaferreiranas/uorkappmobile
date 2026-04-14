import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const passwordError = useMemo(() => {
    if (!password) return "Informe a nova senha.";
    if (password.length < 8)
      return "A senha precisa ter ao menos 8 caracteres.";
    return "";
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return "Confirme a nova senha.";
    if (confirmPassword !== password) return "As senhas não coincidem.";
    return "";
  }, [confirmPassword, password]);

  const isFormValid = !passwordError && !confirmPasswordError;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Redefinir senha</Text>
            <Text style={styles.subtitle}>
              Escolha uma nova senha para acessar sua conta.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nova senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#A5A5A5"
                secureTextEntry
                style={[styles.input, passwordError ? styles.inputError : null]}
                textContentType="newPassword"
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repita a nova senha"
                placeholderTextColor="#A5A5A5"
                secureTextEntry
                style={[
                  styles.input,
                  confirmPasswordError ? styles.inputError : null,
                ]}
                textContentType="password"
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid && styles.disabledButton,
              ]}
              onPress={() => setSubmitted(true)}
              disabled={!isFormValid}
              accessibilityState={{ disabled: !isFormValid }}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !isFormValid && styles.disabledButtonText,
                ]}
              >
                Redefinir senha
              </Text>
            </TouchableOpacity>

            {submitted ? (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>
                  Sua senha foi redefinida com sucesso. Agora você pode fazer
                  login com sua nova senha.
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.createAccountLink}
            >
              <Text style={styles.createAccountText}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#E75A2B",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 22,
    paddingVertical: 30,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#1F1F1F",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#E75A2B",
  },
  errorText: {
    marginTop: 8,
    color: "#D32F2F",
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#E75A2B",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#F0A38C",
  },
  disabledButtonText: {
    color: "#FFFFFFCC",
  },
  successMessage: {
    marginTop: 18,
    padding: 14,
    backgroundColor: "#E8F6EC",
    borderRadius: 16,
  },
  successText: {
    color: "#176B36",
    fontSize: 14,
    lineHeight: 20,
  },
  createAccountLink: {
    marginTop: 18,
    alignItems: "center",
  },
  createAccountText: {
    color: "#E75A2B",
    fontWeight: "700",
  },
});
