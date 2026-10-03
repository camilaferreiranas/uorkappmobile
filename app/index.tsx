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
import { useAuth } from "../contexts/auth-context";

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user, loading } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, router, user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Uork</Text>
        <Text style={styles.subtitle}>Simples. Confiável. Feito para você.</Text>
      </View>

      {!loading && !user ? (
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
      ) : null}
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
    gap: 12,
  },
  link: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
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
