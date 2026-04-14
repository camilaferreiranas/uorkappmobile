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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const emailError = useMemo(() => {
    if (!email.trim()) return "Informe o e-mail cadastrado.";
    if (!emailRegex.test(email)) return "Digite um e-mail válido.";
    return "";
  }, [email]);

  const isFormValid = !emailError;

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
            <Text style={styles.title}>Esqueci a senha</Text>
            <Text style={styles.subtitle}>
              Informe seu e-mail e enviaremos um link para criar uma nova senha.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="email@teste.com"
                placeholderTextColor="#A5A5A5"
                style={[styles.input, emailError ? styles.inputError : null]}
                textContentType="emailAddress"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid && styles.disabledButton,
              ]}
              onPress={() => setSent(true)}
              disabled={!isFormValid}
              accessibilityState={{ disabled: !isFormValid }}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !isFormValid && styles.disabledButtonText,
                ]}
              >
                Enviar link
              </Text>
            </TouchableOpacity>

            {sent ? (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>
                  Se o e-mail estiver cadastrado, você receberá instruções para
                  redefinir sua senha.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/reset-password")}
                  style={styles.successButton}
                >
                  <Text style={styles.successButtonText}>
                    Ir para redefinir senha
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.createAccountLink}
            >
              <Text style={styles.createAccountText}>
                Lembrei minha senha, voltar ao login
              </Text>
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
  successButton: {
    marginTop: 14,
    backgroundColor: "#E75A2B",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontWeight: "700",
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
