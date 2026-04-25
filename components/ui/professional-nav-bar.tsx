import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ProfessionalTab = "inicio" | "demandas" | "relatorio" | "perfil";

interface NavItem {
  label: string;
  icon: string;
  tab: ProfessionalTab;
  route: string;
}

const items: NavItem[] = [
  { label: "Início", icon: "home", tab: "inicio", route: "/professional-home" },
  { label: "Demandas", icon: "list-alt", tab: "demandas", route: "/professional-demands" },
  { label: "Relatório", icon: "bar-chart", tab: "relatorio", route: "/professional-report" },
  { label: "Perfil", icon: "person", tab: "perfil", route: "/professional-profile" },
];

interface ProfessionalNavBarProps {
  active: ProfessionalTab;
}

export function ProfessionalNavBar({ active }: ProfessionalNavBarProps) {
  const router = useRouter();

  return (
    <View style={styles.nav}>
      {items.map((item) => {
        const isActive = active === item.tab;
        return (
          <TouchableOpacity
            key={item.tab}
            style={styles.navItem}
            onPress={() => router.replace(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <MaterialIcons
                name={item.icon as any}
                size={22}
                color={isActive ? "#0D3D8B" : "#7A7A95"}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 14,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  iconWrapper: {
    width: 42,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: "#E8EDFA",
  },
  label: {
    color: "#7A7A95",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },
  labelActive: {
    color: "#0D3D8B",
    fontWeight: "700",
  },
});
