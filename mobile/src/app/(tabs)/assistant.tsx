import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { analyzeSymptoms, type AiMessage } from "@/lib/ai-api";

export default function Assistant() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const message = await analyzeSymptoms();
      setMessages((prev) => [...prev, message]);
    } catch {
      setError("No se pudo analizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-3 p-4">
      <Text className="text-xl font-bold text-primary">Asistente IA</Text>
      {messages.length === 0 && !loading ? (
        <Text className="text-center font-sans text-muted">
          Analiza tus sintomas registrados con la IA.
        </Text>
      ) : null}
      {messages.map((m) => (
        <Card key={m.id}>
          <Text className="font-sans text-primary">{m.content}</Text>
        </Card>
      ))}
      {loading ? <Text className="text-center font-sans text-muted">Analizando...</Text> : null}
      {error ? <Text className="text-center text-danger">{error}</Text> : null}
      <Button label={loading ? "Analizando..." : "Analizar mis sintomas"} onPress={onAnalyze} disabled={loading} />
    </ScrollView>
  );
}
