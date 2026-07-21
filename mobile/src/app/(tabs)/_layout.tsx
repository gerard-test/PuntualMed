import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }} edges={["top"]}> 
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtle,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="medications"
          options={{
            title: "Medicamentos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="medkit-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendario",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="symptoms"
          options={{
            title: "Síntomas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pulse-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: "IA",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles-outline" color={color} size={size} />
            ),
          }}
        />

        {/* RUTAS OCULTAS DEL TAB BAR */}
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="add-medication" options={{ href: null }} />
        <Tabs.Screen name="medication-detail" options={{ href: null }} />
        <Tabs.Screen name="register-symptom" options={{ href: null }} />
        <Tabs.Screen name="edit-medication" options={{ href: null }} />
        <Tabs.Screen name="symptom-detail" options={{ href: null }} />
        <Tabs.Screen name="family" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}