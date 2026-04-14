import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { AuthHeader } from "../../components/ui/auth-header";
import { Card } from "../../components/ui/card";
import { SuccessMessage } from "../../components/ui/success-message";

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
    <ScreenContainer>
      <AuthHeader 
        title="Esqueci a senha" 
        subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha." 
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

        <Button
          title="Enviar link"
          onPress={() => setSent(true)}
          disabled={!isFormValid}
          style={styles.submitButton}
        />

        {sent && (
          <>
            <SuccessMessage 
              message="Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha." 
            />
            <Button
              title="Ir para redefinir senha"
              onPress={() => router.push("/reset-password")}
              style={styles.resetLinkButton}
            />
          </>
        )}

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Lembrei minha senha, voltar ao login
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
  resetLinkButton: {
    marginTop: 14,
    paddingVertical: 12,
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
