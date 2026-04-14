import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { AuthHeader } from "../../components/ui/auth-header";
import { Card } from "../../components/ui/card";

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
    <ScreenContainer>
      <AuthHeader 
        title="Criar Conta" 
        subtitle="Preencha seus dados para criar sua conta." 
      />

      <Card>
        <Input
          label="Nome completo"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Digite seu nome completo"
          returnKeyType="next"
          autoCapitalize="words"
          error={fullNameError}
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

        <Button
          title="Criar conta"
          onPress={() => router.replace("/home")}
          disabled={!isFormValid}
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
});
