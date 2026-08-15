import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";

interface ProfileScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ProfileScreenHeader({ title, subtitle }: ProfileScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.row, subtitle ? styles.rowWithSubtitle : undefined]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.textContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
  },
  row: {
    minHeight: 62,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowWithSubtitle: {
    minHeight: 70,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#FFE4D8",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    textAlign: "center",
  },
  spacer: {
    width: 48,
  },
});
