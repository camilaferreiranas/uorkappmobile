import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/theme";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Uork</Text>
        <Text style={styles.subtitle}>Simples. Confiável. Feito para você.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Criar conta" onPress={() => router.replace("/signup")} />
        <Pressable
          onPress={() => router.replace("/login")}
          style={styles.link}
          accessibilityRole="link"
          hitSlop={8}
        >
          <Text style={styles.linkText}>Já tenho conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brand: {
    color: Colors.brandPrimary,
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  actions: {
    paddingBottom: 32,
    gap: 8,
    alignItems: "center",
  },
  link: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: Colors.brandPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
});
