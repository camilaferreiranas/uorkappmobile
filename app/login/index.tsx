import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Pressable, View } from "react-native";
import { Colors } from "../../constants/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { AuthHeader } from "../../components/ui/auth-header";
import { GoogleSignInButton } from "../../components/ui/google-sign-in-button";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { useAuth } from "../../contexts/auth-context";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { promptAsync, loading: googleLoading, error: googleError } = useGoogleAuth(() =>
    router.replace("/home")
  );

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, router, user]);

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

  async function handleLogin() {
    setSubmitError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/home");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <AuthHeader
        title="Acesse sua conta"
        subtitle="Entre com seu e-mail e senha para continuar."
      />

        <GoogleSignInButton
          onPress={promptAsync}
          loading={googleLoading}
          disabled={submitting}
        />

        {googleError ? (
          <Text style={styles.errorText}>{googleError}</Text>
        ) : null}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="email@teste.com"
          error={emailError}
          textContentType="emailAddress"
          testID="login-email-input"
        />

        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          secureTextEntry
          error={passwordError}
          textContentType="password"
          testID="login-password-input"
        />

        {submitError ? (
          <Text testID="login-error-message" style={styles.errorText}>
            {submitError}
          </Text>
        ) : null}

        <Button
          title="Entrar"
          onPress={handleLogin}
          disabled={!isFormValid || submitting || googleLoading}
          loading={submitting}
          disabledReason="Informe um e-mail válido e uma senha de ao menos 8 caracteres."
          style={styles.submitButton}
          testID="login-submit-button"
        />

        <Pressable
          onPress={() => router.push("/forgot-password")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/signup")}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Ainda não tem conta? Criar conta
          </Text>
        </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 8,
  },
  link: {
    marginTop: 18,
    alignItems: "center",
  },
  linkText: {
    color: Colors.brandPrimary,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
});
