import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/home");
    }, 2500);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    return () => clearTimeout(timeout);
  }, [fadeAnim, router]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.brand}>Uork</Text>
        <Text style={styles.subtitle}>
          Conecte seu intelecto a uma geração de ideias
        </Text>
      </Animated.View>

      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/signup")}
        >
          <Text style={styles.primaryButtonText}>Criar conta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E75A2B",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  brand: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 280,
  },
  actions: {
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#E75A2B",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
