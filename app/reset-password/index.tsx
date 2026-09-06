import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScreenContainer } from "../../components/ui/screen-container";
import { AuthHeader } from "../../components/ui/auth-header";
import { SuccessMessage } from "../../components/ui/success-message";

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
    <ScreenContainer>
      <AuthHeader 
        title="Redefinir senha" 
        subtitle="Escolha uma nova senha para acessar sua conta." 
      />

      <Input
          label="Nova senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          error={passwordError}
          textContentType="newPassword"
        />

        <Input
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita a nova senha"
          secureTextEntry
          error={confirmPasswordError}
          textContentType="password"
        />

        <Button
          title="Redefinir senha"
          onPress={() => setSubmitted(true)}
          disabled={!isFormValid}
          disabledReason="Digite a nova senha (mín. 8 caracteres) e repita-a igual no segundo campo."
          style={styles.submitButton}
        />

        {submitted && (
          <SuccessMessage
            message="Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha."
          />
        )}

        <Pressable
          onPress={() => router.push("/login")}
          style={styles.link}
          accessibilityRole="link"
          hitSlop={8}
        >
          <Text style={styles.linkText}>Voltar ao login</Text>
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
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: {
    color: Colors.brandPrimary,
    fontWeight: "700",
  },
});
