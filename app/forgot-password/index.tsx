import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { AuthHeader } from "../../components/ui/auth-header";
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
          disabledReason="Informe um e-mail válido para receber o link de redefinição."
          style={styles.submitButton}
        />

        {sent && (
          <>
            <SuccessMessage
              message="Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha."
            />
            <Button
              title="Já tenho o código, redefinir senha"
              variant="outline"
              onPress={() => router.push("/reset-password")}
              style={styles.resetLinkButton}
            />
          </>
        )}

        <Pressable
          onPress={() => router.push("/login")}
          style={styles.link}
          accessibilityRole="link"
          hitSlop={8}
        >
          <Text style={styles.linkText}>Lembrei minha senha, voltar ao login</Text>
        </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 8,
  },
  resetLinkButton: {
    marginTop: 14,
  },
  link: {
    marginTop: 18,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: {
    color: Colors.brandPrimary,
    fontWeight: "700",
  },
});
