import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette } from "@/constants/puntualmed";
import { useAuth } from "@/contexts/auth";
import { resetPassword } from "@/lib/supabase-auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginView = "login" | "recover";

export default function LoginScreen() {
  const { session, signIn, isLoading } = useAuth();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");

  const [view, setView] = useState<LoginView>("login");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverSent, setRecoverSent] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const emailError = useMemo(() => {
    if (!submitted && !email) return "";
    if (!normalizedEmail) return "Ingresa tu correo electronico.";
    if (!emailPattern.test(normalizedEmail)) return "Ingresa un correo valido.";
    return "";
  }, [email, normalizedEmail, submitted]);

  const passwordError = useMemo(() => {
    if (!submitted && !password) return "";
    if (!password) return "Ingresa tu contrasena.";
    if (password.length < 8)
      return "La contrasena debe tener al menos 8 caracteres.";
    return "";
  }, [password, submitted]);

  const canSubmit = Boolean(
    normalizedEmail && password && !emailError && !passwordError,
  );

  async function handleLogin() {
    setSubmitted(true);
    setAuthError("");
    if (!emailPattern.test(normalizedEmail) || password.length < 8) return;
    try {
      await signIn(normalizedEmail, password);
      router.replace("/");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "No se pudo iniciar sesion.",
      );
    }
  }

  async function handleRecover() {
    if (
      !recoverEmail.trim() ||
      !emailPattern.test(recoverEmail.trim().toLowerCase())
    ) {
      setAuthError("Ingresa un correo electronico valido.");
      return;
    }
    setAuthError("");
    setRecoverLoading(true);
    try {
      await resetPassword(recoverEmail.trim().toLowerCase());
      setRecoverSent(true);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "No se pudo enviar el correo.",
      );
    } finally {
      setRecoverLoading(false);
    }
  }

  if (isLoading && !session) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: palette.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={palette.navy} />
      </SafeAreaView>
    );
  }

  if (view === "recover") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.brandMark}>
            <Image
              source={require("../assets/images/PuntualMed.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brand}>PuntualMed</Text>
          <Text style={styles.subtitle}>Recuperar contrasena</Text>

          {recoverSent ? (
            <View style={styles.verificationBanner}>
              <Text style={styles.verificationText}>
                Se ha enviado un correo a {recoverEmail} con instrucciones para
                restablecer tu contrasena. Revisa tu bandeja de entrada y sigue
                el enlace.
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Correo electronico</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!recoverLoading}
                keyboardType="email-address"
                onChangeText={setRecoverEmail}
                placeholder="tu@email.com"
                placeholderTextColor={palette.grayLight}
                textContentType="emailAddress"
                value={recoverEmail}
                style={styles.input}
              />
              {authError ? (
                <Text style={styles.authError}>{authError}</Text>
              ) : null}
              <Pressable
                style={[
                  styles.primaryButton,
                  recoverLoading && styles.primaryButtonDisabled,
                ]}
                onPress={handleRecover}
                disabled={recoverLoading}
              >
                {recoverLoading ? (
                  <ActivityIndicator color={palette.white} />
                ) : (
                  <Text style={styles.primaryText}>Enviar correo</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setView("login");
                  setAuthError("");
                }}
                style={styles.linkPress}
              >
                <Text style={styles.link}>Volver a inicio de sesion</Text>
              </Pressable>
            </View>
          )}

          {recoverSent && (
            <Pressable
              onPress={() => {
                setView("login");
                setRecoverSent(false);
                setRecoverEmail("");
              }}
              style={styles.linkPress}
            >
              <Text style={styles.link}>Volver a inicio de sesion</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.brandMark}>
          <Image
            source={require("../assets/images/PuntualMed.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brand}>PuntualMed</Text>
        <Text style={styles.subtitle}>
          Recordatorios medicos para pacientes y familiares.
        </Text>

        {/* {session && (
          <View style={styles.sessionBanner}>
            <Text style={styles.sessionBannerText}>
              Sesion iniciada como {session.user?.email ?? "usuario"}
            </Text>
            <Pressable
              style={styles.sessionContinueBtn}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.sessionContinueText}>Continuar</Text>
            </Pressable>
          </View>
        )} */}

        {registered === "true" && (
          <View style={styles.verificationBanner}>
            <Text style={styles.verificationText}>
              Se ha enviado un correo de verificacion. Revisa tu bandeja de
              entrada para confirmar tu cuenta antes de iniciar sesion.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Correo electronico</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="maria@email.com"
            placeholderTextColor={palette.grayLight}
            textContentType="emailAddress"
            value={email}
            style={[styles.input, emailError ? styles.inputError : null]}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
          <Text style={styles.label}>Contrasena</Text>
          <TextInput
            editable={!isLoading}
            onChangeText={setPassword}
            placeholder="Tu contrasena"
            placeholderTextColor={palette.grayLight}
            secureTextEntry
            textContentType="password"
            value={password}
            style={[styles.input, passwordError ? styles.inputError : null]}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
          <Pressable
            onPress={() => {
              setView("recover");
              setAuthError("");
            }}
            style={styles.forgotPress}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contrasena?</Text>
          </Pressable>
          <Pressable
            accessibilityState={{
              disabled: isLoading || (submitted && !canSubmit),
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              isLoading || (submitted && !canSubmit)
                ? styles.primaryButtonDisabled
                : null,
              pressed ? styles.buttonPressed : null,
            ]}
            onPress={handleLogin}
          >
            {isLoading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.primaryText}>Iniciar sesion</Text>
            )}
          </Pressable>
          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <Pressable
            onPress={() => router.push("/register")}
            style={styles.linkPress}
          >
            <Text style={styles.link}>¿No tienes cuenta? Registrate</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  brandMark: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 24,
    height: 72,
    justifyContent: "center",
    marginBottom: 18,
    width: 72,
  },
  brand: {
    color: palette.slate,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: palette.gray,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    backgroundColor: palette.white,
    borderRadius: 22,
    gap: 10,
    marginTop: 28,
    padding: 18,
  },
  label: {
    color: palette.slate,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E5E7EB",
    borderRadius: 14,
    borderWidth: 1,
    color: palette.slate,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputError: { borderColor: palette.red, backgroundColor: "#FEF2F2" },
  errorText: {
    color: palette.red,
    fontSize: 12,
    fontWeight: "700",
    marginTop: -4,
  },
  authError: {
    color: palette.red,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.navy,
    borderRadius: 15,
    marginTop: 10,
    paddingVertical: 14,
  },
  primaryButtonDisabled: { backgroundColor: "#94A3B8" },
  buttonPressed: { opacity: 0.86 },
  primaryText: { color: palette.white, fontSize: 15, fontWeight: "900" },
  logo: { height: 100, width: 100 },
  linkPress: { marginTop: 12, alignItems: "center" },
  link: { color: palette.sky, fontSize: 14, fontWeight: "600" },
  forgotPress: { alignSelf: "flex-end", marginTop: 2 },
  forgotText: { color: palette.sky, fontSize: 13, fontWeight: "600" },
  verificationBanner: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  verificationText: {
    color: palette.navy,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  sessionBanner: {
    alignItems: "center",
    backgroundColor: palette.navy,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    padding: 14,
  },
  sessionBannerText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  sessionContinueBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sessionContinueText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
