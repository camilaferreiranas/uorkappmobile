import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/theme";

const menuItems = [
  { icon: "edit", label: "Editar perfil" },
  { icon: "location-on", label: "Meu endereço" },
  { icon: "notifications", label: "Notificações" },
  { icon: "payment", label: "Formas de pagamento" },
  { icon: "history", label: "Histórico de serviços" },
  { icon: "help-outline", label: "Ajuda e suporte" },
  { icon: "logout", label: "Sair" },
];

export default function PerfilScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MC</Text>
          </View>
          <Text style={styles.name}>Mariana Costa</Text>
          <Text style={styles.email}>mariana.costa@email.com</Text>
          <Text style={styles.phone}>(71) 99234-5678</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Serviços</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>R$ 1.8k</Text>
            <Text style={styles.statLabel}>Gasto total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrapper}>
                <MaterialIcons
                  name={item.icon as any}
                  size={20}
                  color={item.label === "Sair" ? "#D32F2F" : Colors.primary}
                />
              </View>
              <Text style={[styles.menuLabel, item.label === "Sair" && styles.menuLabelDanger]}>
                {item.label}
              </Text>
              {item.label !== "Sair" && (
                <MaterialIcons name="chevron-right" size={20} color="#C4C4C4" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    paddingBottom: 110,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 44,
    paddingBottom: 36,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  email: {
    color: "#FFE5D9",
    fontSize: 13,
    marginBottom: 2,
  },
  phone: {
    color: "#FFE5D9",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8A8A8A",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF0EB",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  menuLabelDanger: {
    color: "#D32F2F",
  },
});
