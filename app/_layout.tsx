import { Stack } from "expo-router";
import {
    DefaultTheme,
    ThemeProvider,
} from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/auth-context";
<<<<<<< HEAD
import { Colors } from "@/constants/theme";
=======
import { NotificationProvider } from "@/contexts/notification-context";
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

export const unstable_settings = {
  anchor: "(tabs)",
};

<<<<<<< HEAD
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
=======
export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
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
          <Stack.Screen name="my-demands/index" />
          <Stack.Screen name="my-proposals/index" />
          <Stack.Screen name="nearby-professionals" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="edit-profile/index" />
          <Stack.Screen name="address" />
          <Stack.Screen name="publish-demand/index" />
          <Stack.Screen name="proposals/index" />
          <Stack.Screen name="search/index" />
          <Stack.Screen name="review/index" />
          <Stack.Screen name="category-providers/index" />
          <Stack.Screen name="send-proposal/index" />
          <Stack.Screen name="demand-details/index" />
          <Stack.Screen name="available-demand-details/index" />
          <Stack.Screen name="demand-candidates/index" />
          <Stack.Screen name="professional-demands/index" />
          <Stack.Screen name="professional-report/index" />
          <Stack.Screen name="professional-profile/index" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Uork" }}
          />
        </Stack>
<<<<<<< HEAD
=======
        </NotificationProvider>
        <StatusBar style="dark" />
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
