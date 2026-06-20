import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { listIntakes } from "@/lib/intakes-api";
import { listMedications } from "@/lib/meds-api";
import { fetchMe } from "@/lib/users-api";
import { adherence, nextDose, todaysMeds } from "@/lib/home-data";

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function loadHome() {
  const [intakes, meds, me] = await Promise.all([
    listIntakes({ from: isoDate(-7), to: isoDate(7) }),
    listMedications(),
    fetchMe(),
  ]);
  return { intakes, meds, me };
}

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();
  const { data, error, loading } = useAsync(loadHome);
  const greetName = data?.me.full_name ?? session?.user?.email ?? "";

  const now = new Date();
  const next = data ? nextDose(data.intakes, data.meds, now) : null;
  const today = data ? todaysMeds(data.intakes, data.meds, now) : [];
  const stats = data ? adherence(data.intakes, now) : null;

  const goProfile = useCallback(() => router.push("/profile"), [router]);

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-primary">Hola {greetName}</Text>
        <Pressable accessibilityRole="button" onPress={goProfile}>
          <Text className="font-semibold text-sky">Perfil</Text>
        </Pressable>
      </View>

      {loading ? <Text className="text-center font-sans text-muted">Cargando...</Text> : null}
      {error ? <Text className="text-center text-danger">No se pudo cargar el inicio</Text> : null}

      {next ? (
        <Card>
          <Text className="font-sans text-muted">Proxima toma</Text>
          <Text className="text-lg font-bold text-primary">{next.name} {next.dose}</Text>
          <Text className="font-sans text-muted">{next.time}</Text>
        </Card>
      ) : null}

      {stats ? (
        <Card>
          <Text className="font-sans text-muted">Adherencia (7 dias)</Text>
          <Text className="text-lg font-bold text-success">{stats.percent}%</Text>
          <Text className="font-sans text-muted">{stats.taken} de {stats.total} tomas</Text>
        </Card>
      ) : null}

      <Card>
        <Text className="mb-2 font-semibold text-primary">Hoy</Text>
        {today.length === 0 ? (
          <Text className="font-sans text-muted">Sin tomas para hoy</Text>
        ) : (
          today.map((row) => (
            <View key={row.id} className="flex-row justify-between py-1">
              <Text className="font-sans text-primary">{row.name} {row.dose}</Text>
              <Text className="font-sans text-muted">{row.time} - {row.status}</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
