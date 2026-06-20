import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { AuthProvider, nextRoute, useAuth } from "@/lib/auth";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading, recovery } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const target = nextRoute({
      hasSession: !!session,
      loading,
      inAuth: segments[0] === "(auth)",
      inApp: segments[0] === "(tabs)",
    });
    if (target) router.replace(target);
  }, [session, loading, segments, router]);

  useEffect(() => {
    if (recovery) router.replace("/update-password");
  }, [recovery, router]);

  if (loading) {
    return <View className="flex-1 bg-primary" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
