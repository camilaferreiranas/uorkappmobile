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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailError = useMemo(() => {
    if (!email.trim()) return "Informe o e-mail.";
    if (!emailRegex.test(email)) return "Digite um e-mail válido.";
    return "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "Informe a senha.";
    if (password.length < 8)
      return "A senha precisa ter ao menos 8 caracteres.";
    return "";
  }, [password]);

  const isFormValid = !emailError && !passwordError;

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
            <Text style={styles.title}>Bem-vinda de volta</Text>
            <Text style={styles.subtitle}>
              Entre com seu e-mail e senha para acessar o dashboard.
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor="#A5A5A5"
                secureTextEntry
                style={[styles.input, passwordError ? styles.inputError : null]}
                textContentType="password"
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid && styles.disabledButton,
              ]}
              onPress={() => router.replace("/home")}
              disabled={!isFormValid}
              accessibilityState={{ disabled: !isFormValid }}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !isFormValid && styles.disabledButtonText,
                ]}
              >
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
              style={styles.createAccountLink}
            >
              <Text style={styles.createAccountText}>
                Ainda não tem conta? Criar conta
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
  forgotPasswordLink: {
    marginTop: 16,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#E75A2B",
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
