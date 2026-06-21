import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { analyzeSymptoms, type AiMessage } from "@/lib/ai-api";
import { listSymptoms } from "@/lib/symptoms-api";
import { useAsync } from "@/lib/use-async";

export default function Assistant() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: symptoms } = useAsync(listSymptoms);

  async function onAnalyze(symptomId?: string) {
    setLoading(true);
    setError(null);
    try {
      const message = await analyzeSymptoms(symptomId);
      setMessages((prev) => [...prev, message]);
    } catch {
      setError("No se pudo analizar");
    } finally {
      setLoading(false);
    }
  }

  const symptomList = symptoms ?? [];

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-3 p-4">
      <Text className="text-xl font-bold text-primary">Asistente IA</Text>

      {messages.length === 0 && !loading ? (
        <Text className="text-center font-sans text-muted">
          Analiza tus síntomas registrados con la IA.
        </Text>
      ) : null}

      {messages.map((m) => (
        <Card key={m.id}>
          <Text className="font-sans text-primary">{m.content}</Text>
        </Card>
      ))}

      {loading ? <Text className="text-center font-sans text-muted">Analizando...</Text> : null}
      {error ? <Text className="text-center text-danger">{error}</Text> : null}

      <Button
        label={loading ? "Analizando..." : "Analizar todos"}
        onPress={() => onAnalyze(undefined)}
        disabled={loading}
      />

      {symptomList.length === 0 ? (
        <Text className="text-center font-sans text-muted">
          Registra síntomas para analizarlos con la IA.
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {symptomList.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              onPress={() => onAnalyze(s.id)}
              disabled={loading}
              className="rounded-full bg-sky px-3 py-1"
            >
              <Text className="font-sans text-white">{s.description}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
