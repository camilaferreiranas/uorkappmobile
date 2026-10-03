import { Stack } from "expo-router";
import {
    DefaultTheme,
    ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/auth-context";
import { Colors } from "@/constants/theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

/** Navigation chrome mapped onto Uork tokens. */
const UorkNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.brandPrimary,
    background: Colors.surfaceNeutral,
    card: Colors.surfaceWhite,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.error,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={UorkNavTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.surfaceNeutral },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login/index" />
          <Stack.Screen name="signup/index" />
          <Stack.Screen name="forgot-password/index" />
          <Stack.Screen name="reset-password/index" />
          <Stack.Screen name="professional-home/index" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="publish-demand/index" />
          <Stack.Screen name="proposals/index" />
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
            options={{ presentation: "modal", title: "Uork" }}
          />
        </Stack>
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
