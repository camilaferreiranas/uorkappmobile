import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthHeader } from "../../components/ui/auth-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { GoogleSignInButton } from "../../components/ui/google-sign-in-button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { Colors } from "../../constants/theme";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { createUser } from "../../services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { promptAsync, loading: googleLoading, error: googleError } = useGoogleAuth(() =>
    router.replace("/home")
  );

  const nomeError = useMemo(() => {
    if (!nome.trim()) return "Informe o nome.";
    return "";
  }, [nome]);

  const sobrenomeError = useMemo(() => {
    if (!sobrenome.trim()) return "Informe o sobrenome.";
    return "";
  }, [sobrenome]);

  const documentoError = useMemo(() => {
    if (!documento.trim()) return "Informe o documento.";
    return "";
  }, [documento]);

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
    !nomeError &&
    !sobrenomeError &&
    !documentoError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError;

  const handleSignup = async () => {
    setSubmitError("");
    setLoading(true);

    try {
      await createUser({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        senha: password,
        documento: documento.trim(),
        tipoPessoa: "PF",
      });
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao criar conta. Tente novamente.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AuthHeader
        title="Criar Conta"
        subtitle="Preencha seus dados para criar sua conta."
      />

      <Card>
        <GoogleSignInButton
          label="Cadastrar com Google"
          onPress={promptAsync}
          loading={googleLoading}
        />

        {googleError ? (
          <Text style={styles.errorText}>{googleError}</Text>
        ) : null}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou cadastre com e-mail</Text>
          <View style={styles.dividerLine} />
        </View>

        <Input
          label="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome"
          returnKeyType="next"
          autoCapitalize="words"
          error={nomeError}
        />

        <Input
          label="Sobrenome"
          value={sobrenome}
          onChangeText={setSobrenome}
          placeholder="Digite seu sobrenome"
          returnKeyType="next"
          autoCapitalize="words"
          error={sobrenomeError}
        />

        <Input
          label="Documento"
          value={documento}
          onChangeText={setDocumento}
          placeholder="CPF ou CNPJ"
          returnKeyType="next"
          autoCapitalize="none"
          error={documentoError}
        />

        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="email@teste.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={emailError}
        />

        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          textContentType="newPassword"
          error={passwordError}
        />

        <Input
          label="Confirmação de senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita sua senha"
          secureTextEntry
          textContentType="password"
          error={confirmPasswordError}
        />

        {submitError ? (
          <Text style={styles.errorText}>{submitError}</Text>
        ) : null}

        <Button
          title="Criar conta"
          onPress={handleSignup}
          disabled={!isFormValid || loading}
          loading={loading}
          style={styles.submitButton}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
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
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: "500",
  },
});
