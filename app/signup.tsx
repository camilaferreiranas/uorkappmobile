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

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fullNameError = useMemo(() => {
    const trimmed = fullName.trim();
    if (!trimmed) return "Informe o nome completo.";
    if (trimmed.split(" ").filter(Boolean).length < 2)
      return "Digite nome e sobrenome.";
    return "";
  }, [fullName]);

  const emailError = useMemo(() => {
    if (!email.trim()) return "Informe o e-mail.";
    if (!emailRegex.test(email))
      return "Digite um e-mail válido, ex: email@teste.com.";
    return "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "Informe a senha.";
    if (password.length < 8)
      return "A senha precisa ter ao menos 8 caracteres.";
    return "";
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return "Confirme a senha.";
    if (confirmPassword !== password) return "As senhas não coincidem.";
    return "";
  }, [confirmPassword, password]);

  const isFormValid =
    !fullNameError && !emailError && !passwordError && !confirmPasswordError;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para criar sua conta.
          </Text>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={[styles.input, fullNameError ? styles.inputError : null]}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#A5A5A5"
                returnKeyType="next"
                autoCapitalize="words"
              />
              {fullNameError ? (
                <Text style={styles.errorText}>{fullNameError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="email@teste.com"
                placeholderTextColor="#A5A5A5"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
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
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#A5A5A5"
                secureTextEntry
                textContentType="newPassword"
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmação de senha</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={[
                  styles.input,
                  confirmPasswordError ? styles.inputError : null,
                ]}
                placeholder="Repita sua senha"
                placeholderTextColor="#A5A5A5"
                secureTextEntry
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
                Criar conta
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
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    color: "#292929",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F4F4F4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#111111",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#E75A2B",
  },
  errorText: {
    marginTop: 6,
    color: "#D32F2F",
    fontSize: 13,
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: "#E75A2B",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
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
    color: "#FFFFFFAA",
  },
});
