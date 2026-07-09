import { useState } from "react";
import { Text, View, Image } from "react-native"; // 1. Se añade Image aquí
import { Link } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/auth-actions";

// 2. Importamos el logo apuntando a tus assets (puedes cambiar 'react-logo.png' por tu archivo)
import logoImg from "../../../assets/images/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // El guard del root layout redirige a /home cuando la sesion cambia.
  async function onSubmit() {
    setLoading(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <View className="flex-1 justify-center gap-4 bg-white px-6">
      
      {/* 3. Se añade el componente Image con clases de Tailwind para el tamaño y centrado */}
      <Image 
        source={logoImg} 
        className="w-32 h-32 self-center object-contain mb-2" 
      />

      <Text className="text-center text-3xl font-bold text-primary">PuntualMed</Text>
      <Text className="mb-4 text-center font-sans text-muted">
        Tu tratamiento, guiado por inteligencia
      </Text>
      <Input value={email} onChangeText={setEmail} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" />
      <Input value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      <Button label={loading ? "Ingresando..." : "Iniciar sesión"} onPress={onSubmit} disabled={loading} />
      <Link href="/forgot-password" className="text-center font-sans text-sky">
        Olvide mi contraseña
      </Link>
      <Link href="/register" className="text-center font-sans text-primary">
        Crear cuenta
      </Link>
    </View>
  );
}