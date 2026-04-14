import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { AuthHeader } from "../../components/ui/auth-header";
import { Card } from "../../components/ui/card";

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
    <ScreenContainer>
      <AuthHeader 
        title="Bem-vinda de volta" 
        subtitle="Entre com seu e-mail e senha para acessar o dashboard." 
      />

      <Card>
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
        />

        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          secureTextEntry
          error={passwordError}
          textContentType="password"
        />

        <Button
          title="Entrar"
          onPress={() => router.replace("/home")}
          disabled={!isFormValid}
          style={styles.submitButton}
        />

        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/signup")}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Ainda não tem conta? Criar conta
          </Text>
        </TouchableOpacity>
      </Card>
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
    color: Colors.primary,
    fontWeight: "700",
  },
});
