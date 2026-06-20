import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Shell de Hito 0: sin autenticacion real. La logica de login llega en el Hito 1.
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 justify-center gap-4 bg-white px-6">
      <Text className="text-center text-3xl font-bold text-primary">
        PuntualMed
      </Text>
      <Text className="mb-4 text-center font-sans text-muted">
        Tu tratamiento, guiado por inteligencia
      </Text>
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electronico"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="Contrasena"
        secureTextEntry
      />
      <Button label="Iniciar sesion" onPress={() => router.replace("/home")} />
    </View>
  );
}
