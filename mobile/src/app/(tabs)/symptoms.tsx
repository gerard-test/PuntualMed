import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useAsync } from "@/lib/use-async";
import { listSymptoms } from "@/lib/symptoms-api";
import { listMedications } from "@/lib/meds-api";
import { formatTime } from "@/lib/home-data";

async function loadSymptoms() {
  const [symptoms, meds] = await Promise.all([listSymptoms(), listMedications()]);
  return { symptoms, meds };
}

export default function Symptoms() {
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(loadSymptoms);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const medName = (id: string | null) =>
    id ? (data?.meds.find((m) => m.id === id)?.name ?? null) : null;

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-primary">Síntomas</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/register-symptom")}>
          <Text className="text-2xl font-bold text-sky">+</Text>
        </Pressable>
      </View>

      {loading ? <Text className="text-center font-sans text-muted">Cargando...</Text> : null}
      {error ? <Text className="text-center text-danger">No se pudo cargar</Text> : null}
      {data && data.symptoms.length === 0 ? (
        <Text className="text-center font-sans text-muted">Aún no registras síntomas</Text>
      ) : null}

      {(data?.symptoms ?? []).map((s) => (
        <Card key={s.id}>
          <Text className="font-semibold text-primary">{s.description}</Text>
          <Text className="font-sans text-muted">
            {s.severity ?? "sin severidad"} - {s.occurred_at.slice(0, 10)} {formatTime(s.occurred_at)}
          </Text>
          {medName(s.medication_id) ? (
            <Text className="font-sans text-muted">Medicamento: {medName(s.medication_id)}</Text>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
}
