import { useEffect, useRef } from "react";
import { BackHandler, Platform, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import * as Device from "expo-device";
import "react-native-reanimated";

try {
  SplashScreen.preventAutoHideAsync();
} catch {
  // Ignorar si ya está oculto o no disponible
}

import { AuthProvider, useAuth } from "@/contexts/auth";
import { registerForPushNotifications } from "@/lib/notifications";

export const unstable_settings = {
  initialRouteName: "splash-screen",
};

function NotificationGate({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const token = session?.access_token;
  const registered = useRef(false);

  useEffect(() => {
    // Solo intenta registrar el token si existe la sesión, no se ha registrado aún Y es un dispositivo físico
    if (token && !registered.current && Device.isDevice) {
      registered.current = true;
      registerForPushNotifications(token);
    }
  }, [token]);

  useEffect(() => {
    // Si no es un dispositivo físico, omitimos el oyente de notificaciones para evitar errores
    if (!Device.isDevice) return;

    try {
      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, string> | undefined;
        if (data?.intake_id) {
          router.replace("/(tabs)");
        }
      });
      return () => sub.remove();
    } catch {
      // Fallback para entornos donde expo-notifications no esté disponible
    }
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== "android") return;
    (async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch {
        // Ignorar si el modo inmersivo falla en ciertos dispositivos Android
      }
    })();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription?.remove?.();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#000" }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <NotificationGate>
            <Stack initialRouteName="splash-screen">
              <Stack.Screen name="splash-screen" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
            </Stack>
          </NotificationGate>
        </AuthProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}