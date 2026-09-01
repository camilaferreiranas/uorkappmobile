import {
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login/index" />
          <Stack.Screen name="signup/index" />
          <Stack.Screen name="forgot-password/index" />
          <Stack.Screen name="reset-password/index" />
          <Stack.Screen name="professional-home/index" />
          <Stack.Screen name="professional-registration/index" />
          <Stack.Screen name="professional-notifications" />
          <Stack.Screen name="client-notifications" />
          <Stack.Screen name="client-history" />
          <Stack.Screen name="nearby-professionals" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="edit-profile/index" />
          <Stack.Screen name="address" />
          <Stack.Screen name="publish-demand/index" />
          <Stack.Screen name="search/index" />
          <Stack.Screen name="review/index" />
          <Stack.Screen name="category-providers/index" />
          <Stack.Screen name="send-proposal/index" />
          <Stack.Screen name="demand-details/index" />
          <Stack.Screen name="professional-demands/index" />
          <Stack.Screen name="professional-report/index" />
          <Stack.Screen name="professional-profile/index" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        </NotificationProvider>
        <StatusBar style="dark" />
      </AuthProvider>
    </ThemeProvider>
  );
}
