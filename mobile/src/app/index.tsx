import { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";

// Splash de marca; tras un breve instante redirige al login.
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/login"), 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-4xl font-bold text-white">PuntualMed</Text>
    </View>
  );
}
