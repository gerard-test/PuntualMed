import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/supabase";

export type AiMessage = {
  id: string;
  kind: string;
  role: string;
  content: string;
  created_at: string;
};

// El backend analiza el sintoma indicado o todos si symptomId es undefined.
export async function analyzeSymptoms(symptomId?: string): Promise<AiMessage> {
  return apiRequest<AiMessage>("/api/v1/ai/symptoms/analyze", {
    method: "POST",
    body: { symptom_id: symptomId ?? null },
    token: getAccessToken,
  });
}
