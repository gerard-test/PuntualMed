import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/supabase";

export type AiMessage = {
  id: string;
  kind: string;
  role: string;
  content: string;
  created_at: string;
};

// El backend carga los sintomas/meds del usuario; no se envia body.
export async function analyzeSymptoms(): Promise<AiMessage> {
  return apiRequest<AiMessage>("/api/v1/ai/symptoms/analyze", {
    method: "POST",
    token: getAccessToken,
  });
}
