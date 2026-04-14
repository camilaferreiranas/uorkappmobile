import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="signup/index" />
        <Stack.Screen name="forgot-password/index" />
        <Stack.Screen name="reset-password/index" />
        <Stack.Screen name="professional-home/index" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="publish-demand/index" />
        <Stack.Screen name="search/index" />
        <Stack.Screen name="review/index" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
