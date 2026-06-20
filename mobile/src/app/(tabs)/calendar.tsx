import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useAsync } from "@/lib/use-async";
import { listIntakes } from "@/lib/intakes-api";
import { listMedications } from "@/lib/meds-api";
import { listSymptoms } from "@/lib/symptoms-api";
import { dayDetail, dayStatuses, daysInMonth, statusIcon } from "@/lib/calendar-data";

function statusColor(status: "taken" | "missed" | "pending"): string {
  if (status === "taken") return "font-sans text-success";
  if (status === "missed") return "font-sans text-danger";
  return "font-sans text-sky";
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function pad(n: number): string {
  return `${n}`.padStart(2, "0");
}

export default function Calendar() {
  const base = new Date();
  const [offset, setOffset] = useState(0);
  const view = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month0 = view.getMonth();
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const from = `${year}-${pad(month0 + 1)}-01`;
    const to = `${year}-${pad(month0 + 1)}-${daysInMonth(year, month0).length}`;
    const [intakes, meds, symptoms] = await Promise.all([
      listIntakes({ from, to }),
      listMedications(),
      listSymptoms(),
    ]);
    return { intakes, meds, symptoms };
  }, [year, month0]);

  const { data, loading, reload } = useAsync(load);
  // Refetch al cambiar de mes (useAsync solo corre al montar).
  useEffect(() => {
    reload();
  }, [offset, reload]);

  const now = new Date();
  const statuses = data ? dayStatuses(data.intakes, data.symptoms, now) : {};
  const detail = data && selected ? dayDetail(data.intakes, data.meds, data.symptoms, selected, now) : null;

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-3 p-4">
      <View className="flex-row items-center justify-between">
        <Pressable accessibilityRole="button" onPress={() => setOffset((o) => o - 1)}>
          <Text className="text-xl text-sky">{"<"}</Text>
        </Pressable>
        <Text className="text-lg font-bold text-primary">{MONTHS[month0]} {year}</Text>
        <Pressable accessibilityRole="button" onPress={() => setOffset((o) => o + 1)}>
          <Text className="text-xl text-sky">{">"}</Text>
        </Pressable>
      </View>

      {loading ? <Text className="text-center font-sans text-muted">Cargando...</Text> : null}

      <View className="flex-row flex-wrap">
        {daysInMonth(year, month0).map((d) => {
          const key = `${year}-${pad(month0 + 1)}-${pad(d)}`;
          const f = statuses[key];
          const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
          const isToday = key === todayKey;
          const isSelected = key === selected;
          const cellClass = isSelected
            ? "h-12 w-[14.28%] items-center justify-center bg-primary rounded"
            : isToday
              ? "h-12 w-[14.28%] items-center justify-center border border-primary rounded"
              : "h-12 w-[14.28%] items-center justify-center";
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => setSelected(key)}
              className={cellClass}
            >
              <Text className={isSelected ? "font-sans text-white" : "font-sans text-primary"}>{d}</Text>
              <View className="flex-row gap-0.5">
                {f?.taken ? <View className="h-1.5 w-1.5 rounded-full bg-success" /> : null}
                {f?.missed ? <View className="h-1.5 w-1.5 rounded-full bg-danger" /> : null}
                {f?.pending ? <View className="h-1.5 w-1.5 rounded-full bg-sky" /> : null}
                {f?.symptom ? <View className="h-1.5 w-1.5 rounded-full bg-warning" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Text className="font-sans text-xs text-success">● Tomada</Text>
        <Text className="font-sans text-xs text-danger">● Vencida</Text>
        <Text className="font-sans text-xs text-sky">● Pendiente</Text>
        <Text className="font-sans text-xs text-warning">● Síntoma</Text>
      </View>

      {detail ? (
        <Card className="gap-1">
          <Text className="font-semibold text-primary">Viendo: {selected}</Text>
          {detail.meds.length === 0 && detail.symptoms.length === 0 ? (
            <Text className="font-sans text-muted">Sin registros</Text>
          ) : null}
          {detail.meds.map((m) => (
            <View key={m.id} className="flex-row items-center gap-1">
              <Text className={statusColor(m.status)}>{statusIcon(m.status)}</Text>
              <Text className="font-sans text-primary">{m.time} - {m.name}</Text>
            </View>
          ))}
          {detail.symptoms.map((s) => (
            <View key={s.id} className="flex-row items-center gap-1">
              <Text className="font-sans text-warning">!</Text>
              <Text className="font-sans text-warning">Síntoma: {s.description}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </ScrollView>
  );
}
