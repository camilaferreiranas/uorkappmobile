import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
<<<<<<< HEAD
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radii, Shadow } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brandPrimary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 20,
          height: 64,
          borderRadius: Radii.pill,
          borderTopWidth: 0,
          backgroundColor: Colors.surfaceWhite,
          paddingHorizontal: 12,
          ...Shadow.floating,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 11,
=======
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        width: 42,
        height: 30,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? Colors.primaryLight : "transparent",
      }}
    >
      <MaterialIcons name={name} size={23} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();
  const bottomPadding = Math.max(insets.bottom, 10);

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 0,
          borderWidth: 0,
          borderColor: "transparent",
          paddingTop: 8,
          height: 62 + bottomPadding,
          paddingBottom: bottomPadding,
          shadowColor: Colors.ink,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 14,
        },
        sceneStyle: {
          backgroundColor: Colors.background,
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
<<<<<<< HEAD
          title: "Explorar",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="square.grid.2x2.fill" color={color} />
=======
          title: "Buscar",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search" color={color} focused={focused} />
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
          ),
        }}
      />
      <Tabs.Screen
        name="publicar/index"
        options={{
          title: "Publicar",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="add-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
