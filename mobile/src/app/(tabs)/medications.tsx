import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useAsync } from "@/lib/use-async";
import { listMedications } from "@/lib/meds-api";

export default function Medications() {
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(listMedications);

  // Recarga al volver a la pestania (p. ej. tras agregar un medicamento).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-primary">Medicamentos</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/add-medication")}>
          <Text className="text-2xl font-bold text-sky">+</Text>
        </Pressable>
      </View>

      {loading ? <Text className="text-center font-sans text-muted">Cargando...</Text> : null}
      {error ? <Text className="text-center text-danger">No se pudo cargar</Text> : null}
      {data && data.length === 0 ? (
        <Text className="text-center font-sans text-muted">Aun no tienes medicamentos</Text>
      ) : null}

      {(data ?? []).map((med) => (
        <Pressable
          key={med.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/medication-detail", params: { id: med.id } })}
        >
          <Card>
            <Text className="font-semibold text-primary">{med.name} {med.dose}</Text>
            <Text className="font-sans text-muted">{med.schedules.length} horario(s)</Text>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
