import { useCallback, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { confirmIntake, listIntakes } from "@/lib/intakes-api";
import { listMedications } from "@/lib/meds-api";
import { listSymptoms } from "@/lib/symptoms-api";
import { fetchMe } from "@/lib/users-api";
import {
  addDays,
  formatTime,
  monthRange,
  monthSummary,
  monthlyAdherence,
  monthlyCalendarData,
  nextPendingIntake,
  todaysMeds,
} from "@/lib/home-data";
import Header from "@/components/ui/home/Header";
import NextMedicationCard from "@/components/ui/home/NextMedicationCard";
import TodayMedications from "@/components/ui/home/TodayMedications";
import MonthlyCalendar from "@/components/ui/home/MonthlyCalendar";
import MonthlySummary from "@/components/ui/home/MonthlySummary";
import AdherenceCard from "@/components/ui/home/AdherenceCard";

<<<<<<< HEAD
// Iconos nativos compatibles para sustituir lucide-react web
import { Bell, User, Activity, Bot, CheckCircle2, Clock } from "lucide-react-native";

// Función para generar los días de la semana actual de forma dinámica
function getDynamicWeekDays() {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0: Dom, 1: Lun, ... 6: Sáb
  
  // Calcular la fecha del Lunes de esta semana
  const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const daysLabel = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return daysLabel.map((dayLabel, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);

    const isToday = dayDate.toDateString() === now.toDateString();

    return {
      day: dayLabel,
      num: dayDate.getDate(),
      isToday,
      // Se pueden vincular con datos reales según se requiera
      taken: isToday ? true : index < distanceToMonday, 
      missed: false, 
      symptom: false 
    };
  });
}

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
=======
// Rango de datos a traer: desde el 1° del mes anterior (para el comparativo de
// adherencia) hasta una semana después de fin del mes actual (para no perder
// la "próxima toma" cuando cae justo a inicios del mes siguiente).
function loadRange(now: Date) {
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { from } = monthRange(prevMonth);
  const { to } = monthRange(now);
  return { from, to: monthRange(addDays(new Date(to), 7)).from };
>>>>>>> 730796d629f822288d9da3dfd2cf7b90e676791f
}

async function loadHome() {
  const now = new Date();
  const { from, to } = loadRange(now);
  const [intakes, meds, symptoms, me] = await Promise.all([
    listIntakes({ from, to }),
    listMedications(),
    listSymptoms(),
    fetchMe(),
  ]);
  return { intakes, meds, symptoms, me };
}

function greetingByHour(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();
  const { data, error, loading, reload } = useAsync(loadHome);
  const greetName = data?.me.full_name ?? session?.user?.email ?? "Usuario";

<<<<<<< HEAD
  // Generamos los días dinámicos de esta semana
  const weekDays = getDynamicWeekDays();

  // Función para obtener el saludo dinámico según la hora del dispositivo
  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) {
      return "Buenos días";
    } else if (hora >= 12 && hora < 19) {
      return "Buenas tardes";
    } else {
      return "Buenas noches";
    }
  };

=======
>>>>>>> 730796d629f822288d9da3dfd2cf7b90e676791f
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const now = new Date();

  const upcoming = data ? nextPendingIntake(data.intakes, now) : null;
  const upcomingMed = upcoming
    ? (data!.meds.find((m) => m.id === upcoming.medication_id) ?? null)
    : null;
  const todayMedsList = data ? todaysMeds(data.intakes, data.meds, now) : [];
  const calendarData = data ? monthlyCalendarData(data.intakes, data.symptoms, now) : [];
  const summary = data ? monthSummary(data.intakes, data.symptoms, now) : null;
  const adherenceStats = data ? monthlyAdherence(data.intakes, now) : null;

  const adherenceDifference = useMemo(() => {
    if (!data || !adherenceStats) return 0;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previous = monthlyAdherence(data.intakes, prevMonth);
    return adherenceStats.percentage - previous.percentage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, adherenceStats]);

  const goProfile = useCallback(() => router.push("/profile"), [router]);
  const goNotifications = useCallback(() => router.push("/notifications"), [router]);
  const goCalendar = useCallback(() => router.push("/calendar"), [router]);
  const goMedication = useCallback(
    (intakeId: string) => {
      const intake = data?.intakes.find((i) => i.id === intakeId);
      if (intake) {
        router.push({ pathname: "/medication-detail", params: { id: intake.medication_id } });
      }
    },
    [data, router],
  );

  async function onConfirm(id: string) {
    await confirmIntake(id);
    reload();
  }

  return (
<<<<<<< HEAD
    <View className="flex-1 bg-[#F3F4F6]">
      {/* Header */}
      <View className="bg-white flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View className="w-10 h-10 rounded-full bg-white justify-center items-center p-0.5 border border-gray-200">
            <Image 
              source={require("../../../assets/images/logo.png")} 
              className="w-full h-full rounded-full"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-[#6B7280] text-xs font-medium">{obtenerSaludo()}</Text>
            <Text className="text-[#1E293B] font-bold text-base" numberOfLines={1}>
              Hola, {greetName} 👋
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-2">
          <Pressable onPress={goNotifications} className="w-9 h-9 rounded-full bg-[#F3F4F6] items-center justify-center relative">
            <Bell size={20} className="text-[#1E293B]" />
            <View className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
          </Pressable>
          <Pressable onPress={goProfile} className="w-9 h-9 rounded-full bg-[#1E3A8A] items-center justify-center">
            <User size={20} className="text-white" />
          </Pressable>
        </View>
      </View>
=======
    <View className="flex-1 bg-[#F8FAFC]">
      <Header
        greeting={greetingByHour()}
        name={greetName}
        onNotifications={goNotifications}
        onProfile={goProfile}
      />
>>>>>>> 730796d629f822288d9da3dfd2cf7b90e676791f

      {loading && <Text className="text-center text-xs text-muted my-1">Actualizando datos...</Text>}
      {error && <Text className="text-center text-xs text-danger my-1">No se pudo cargar el inicio</Text>}

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10">
        {upcoming && upcomingMed ? (
          <NextMedicationCard
            medication={`${upcomingMed.name} ${upcomingMed.dose}`}
            dose="Vía oral"
            hour={formatTime(upcoming.scheduled_at)}
            onConfirm={() => onConfirm(upcoming.id)}
          />
        ) : (
          <View className="mt-4 rounded-3xl bg-[#0B3AAE] p-6 items-center justify-center">
            <Text className="text-white font-semibold text-base">
              No tienes tomas pendientes inmediatas
            </Text>
          </View>
        )}

        <TodayMedications
          medications={todayMedsList.map((row) => ({
            id: row.id,
            name: row.name,
            dosage: row.dose,
            hour: row.time,
            status: row.status,
          }))}
          onPressMedication={goMedication}
        />

        <View className="mt-5">
          <MonthlyCalendar data={calendarData} onDayPress={goCalendar} />
        </View>

<<<<<<< HEAD
        {/* Esta semana Mini Calendar Dinámico */}
        <View>
          <Text className="text-[#1E293B] font-semibold mb-3 text-base">Esta semana</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between gap-1">
              {weekDays.map((d) => (
                <Pressable
                  key={d.day}
                  onPress={() => router.push("/calendar")}
                  className={`flex-1 items-center py-2 rounded-xl ${
                    d.isToday ? 'bg-[#1E3A8A]' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-[10px] mb-1.5 ${d.isToday ? 'text-white/70' : 'text-[#6B7280]'}`}>{d.day}</Text>
                  <Text className={`font-semibold mb-1.5 text-sm ${d.isToday ? 'text-white' : 'text-[#1E293B]'}`}>{d.num}</Text>
                  <View className="flex-col gap-0.5 h-5 justify-center">
                    {d.taken && <View className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />}
                    {d.missed && <View className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />}
                    {d.symptom && <View className="w-1.5 h-1.5 rounded-full bg-[#FCD34D]" />}
                  </View>
                </Pressable>
              ))}
            </View>
            
            {/* Leyenda */}
            <View className="flex-row items-center justify-center gap-4 mt-3 pt-3 border-t border-[#F3F4F6]">
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-[#34D399]" />
                <Text className="text-[#6B7280] text-[11px]">Tomado</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <Text className="text-[#6B7280] text-[11px]">Omitido</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-[#FCD34D]" />
                <Text className="text-[#6B7280] text-[11px]">Síntoma</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Accesos rápidos */}
        <View>
          <Text className="text-[#1E293B] font-semibold mb-3 text-base">Accesos rápidos</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={goRegisterSymptom}
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex-col items-start gap-2 active:scale-95"
            >
              <View className="w-10 h-10 rounded-xl bg-[#ECFDF5] items-center justify-center">
                <Activity size={22} className="text-[#34D399]" />
              </View>
              <View>
                <Text className="text-[#1E293B] font-semibold text-sm">Registrar</Text>
                <Text className="text-[#1E293B] font-semibold text-sm">síntoma</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={goAIChat}
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex-col items-start gap-2 active:scale-95"
            >
              <View className="w-10 h-10 rounded-xl bg-[#EFF6FF] items-center justify-center">
                <Bot size={22} className="text-[#38BDF8]" />
              </View>
              <View>
                <Text className="text-[#1E293B] font-semibold text-sm">Consultar</Text>
                <Text className="text-[#1E293B] font-semibold text-sm">IA</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Adherencia Semanal */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#1E293B] font-semibold text-[15px]">Adherencia semanal</Text>
            <Text className="text-[#34D399] font-bold text-base">{stats ? `${stats.percent}%` : "0%"}</Text>
          </View>
          <View className="w-full bg-[#E5E7EB] rounded-full h-2.5 mb-2">
            <View 
              className="h-2.5 bg-[#34D399] rounded-full" 
              style={{ width: stats ? `${stats.percent}%` : '0%' }} 
            />
          </View>
          <Text className="text-[#6B7280] text-xs">
            {stats ? `${stats.taken} de ${stats.total} tomas registradas` : "Sin tomas registradas"}
          </Text>
        </View>
=======
        {summary && (
          <MonthlySummary
            taken={summary.taken}
            pending={summary.pending}
            missed={summary.missed}
            symptoms={summary.symptoms}
          />
        )}
>>>>>>> 730796d629f822288d9da3dfd2cf7b90e676791f

        {adherenceStats && (
          <AdherenceCard
            percentage={adherenceStats.percentage}
            completed={adherenceStats.completed}
            total={adherenceStats.total}
            difference={adherenceDifference}
          />
        )}
      </ScrollView>
    </View>
  );
}
