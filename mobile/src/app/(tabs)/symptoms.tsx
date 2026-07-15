import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker"; // Importación del selector nativo
import { useAsync } from "@/lib/use-async";
import { listSymptoms } from "@/lib/symptoms-api";
import { listMedications } from "@/lib/meds-api";
import { formatTime } from "@/lib/home-data";

type FilterType = "all" | "week" | "month";

async function loadSymptoms() {
  const [symptoms, meds] = await Promise.all([listSymptoms(), listMedications()]);
  return { symptoms, meds };
}

export default function Symptoms() {
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(loadSymptoms);

  // Estados de filtrado y diseño
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedMed, setSelectedMed] = useState<string>("all"); // Estado para filtrar por medicamento
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const medName = (id: string | null) =>
    id ? (data?.meds.find((m) => m.id === id)?.name ?? null) : null;

  // Lógica de filtrado combinado de síntomas
  const filteredSymptoms = (data?.symptoms ?? []).filter((symptom) => {
    // 1. Filtrar por medicamento seleccionado
    if (selectedMed !== "all" && symptom.medication_id !== selectedMed) {
      return false;
    }
    
    // 2. Aquí puedes añadir las condiciones temporales si las implementas a futuro:
    // if (filter === 'week') { ... }
    
    return true;
  });

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      {/* HEADER */}
      <View className="flex-row items-center justify-between bg-white px-4 py-4 border-b border-[#E5E7EB]">
        <View className="w-6" />
        <Text className="text-xl font-bold text-[#1E293B]">Mis síntomas</Text>
        <Pressable 
          accessibilityRole="button" 
          onPress={() => router.push("/register-symptom")}
          className="p-1"
        >
          <Text className="text-2xl font-semibold text-[#1E3A8A]">+</Text>
        </Pressable>
      </View>

      {/* ECG DECORATION STRIP */}
      <View className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex-row items-center gap-3">
        <Text className="text-[#E5E7EB] text-xl font-bold tracking-tighter">⚡︎⚡︎⚡︎</Text>
        <Text className="text-[#9CA3AF] text-xs">Seguimiento de síntomas con IA</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* HORIZONTAL FILTERS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="flex-row px-4 pt-4 pb-2"
          contentContainerClassName="gap-2"
        >
          {(["all", "week", "month"] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-full ${
                filter === f ? "bg-[#1E3A8A]" : "bg-white border border-[#E5E7EB]"
              }`}
            >
              <Text 
                className={`font-semibold text-xs ${
                  filter === f ? "text-white" : "text-[#6B7280]"
                }`}
              >
                {f === "all" ? "Todos" : f === "week" ? "Esta semana" : "Este mes"}
              </Text>
            </Pressable>
          ))}
          
          {/* SELECTOR DINÁMICO DE MEDICAMENTOS */}
          <View className="bg-white border border-[#E5E7EB] rounded-full justify-center px-2 h-[34px] min-w-[150px]">
            <Picker
              selectedValue={selectedMed}
              onValueChange={(itemValue) => setSelectedMed(itemValue)}
              style={{ color: "#6B7280", transform: [{ scale: 0.85 }] }}
              dropdownIconColor="#6B7280"
            >
              <Picker.Item label="Por medicamento" value="all" />
              {(data?.meds ?? []).map((med) => (
                <Picker.Item key={med.id} label={med.name} value={med.id} />
              ))}
            </Picker>
          </View>
        </ScrollView>

        {/* LOADING & ERROR STATES */}
        {loading ? <Text className="text-center font-sans text-[#6B7280] mt-6">Cargando...</Text> : null}
        {error ? <Text className="text-center text-[#EF4444] mt-6">No se pudo cargar</Text> : null}
        {data && filteredSymptoms.length === 0 && !loading ? (
          <Text className="text-center font-sans text-[#6B7280] mt-6">No hay síntomas registrados con estos filtros</Text>
        ) : null}

        {/* SYMPTOMS LIST */}
        <View className="px-4 space-y-3 pt-2">
          {filteredSymptoms.map((s) => {
            const isExpanded = expandedId === s.id;
            const medicament = medName(s.medication_id);
            const intensityLevel = s.severity ? parseInt(s.severity, 10) || 1 : 1;
            const hasAnalysis = !!s.analysis || s.analyzed; 
            const aiText = s.analysis || "Análisis automático pendiente para este registro. Consulte regularmente a su médico.";

            return (
              <View 
                key={s.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3"
              >
                <Pressable
                  className="p-4"
                  onPress={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <Text className="text-[#1E293B] font-semibold text-base flex-1 pr-2">
                      {s.description}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-[#6B7280] text-[11px]">
                        {s.occurred_at.slice(0, 10)} {formatTime(s.occurred_at)}
                      </Text>
                      <Text className="text-[#9CA3AF] text-xs ml-1">{isExpanded ? "▲" : "▼"}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center flex-wrap gap-2">
                    {medicament ? (
                      <View className="bg-[#EFF6FF] rounded-full px-2.5 py-1">
                        <Text className="text-[#1E3A8A] text-[11px] font-medium">{medicament}</Text>
                      </View>
                    ) : null}

                    <IntensityDots level={intensityLevel} />

                    <View 
                      className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
                        hasAnalysis ? "bg-[#ECFDF5]" : "bg-[#FFF7ED]"
                      }`}
                    >
                      <Text 
                        className={`text-[11px] font-medium ${
                          hasAnalysis ? "text-[#065F46]" : "text-[#92400E]"
                        }`}
                      >
                        {hasAnalysis ? "✓ Analizado por IA" : "🕒 Pendiente análisis"}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* EXPANDED AI ANALYSIS PANEL */}
                {isExpanded && (
                  <View className="px-4 pb-4">
                    <View className="bg-[#F0F9FF] rounded-xl p-4">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-6 h-6 rounded-full bg-[#1A2540] items-center justify-center">
                          <Text className="text-white text-[10px]">🤖</Text>
                        </View>
                        <Text className="text-[#1E3A8A] font-bold text-xs">Análisis de IA</Text>
                      </View>
                      
                      <Text className="text-[#1E293B] text-xs mb-3 leading-4">
                        {aiText}
                      </Text>
                      
                      <Text className="text-[#6B7280] text-[10px] leading-3">
                        Este análisis es orientativo. Consulta a tu médico para confirmar.
                      </Text>

                      <Pressable 
                        className="mt-3 pt-2 border-t border-blue-100 items-end"
                        onPress={() => router.push({ pathname: "/symptom-detail", params: { id: s.id } })}
                      >
                        <Text className="text-[#1E3A8A] text-xs font-semibold">Ver detalle completo →</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function IntensityDots({ level }: { level: number }) {
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: i < level ? "#1E3A8A" : "#E5E7EB" }}
        />
      ))}
    </View>
  );
}