import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { Button } from "../components/ui/button";

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.brand}>Uork</Text>
        <Text style={styles.subtitle}>
          Conecte seu intelecto a uma geração de ideias
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.actions,
          { opacity: fadeAnim, paddingBottom: Math.max(insets.bottom + 24, 56) },
        ]}
      >
        <Button
          title="Criar conta"
          variant="primary"
          onPress={() => router.replace("/signup")}
          style={styles.primaryButton}
          textStyle={styles.primaryButtonText}
        />
        <Button
          title="Já tenho conta"
          variant="ghost"
          onPress={() => router.replace("/login")}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
    color: Colors.white,
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
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: Colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: Colors.white,
  },
});
