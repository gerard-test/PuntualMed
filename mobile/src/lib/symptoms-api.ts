import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/supabase";

export type Symptom = {
  id: string;
  medication_id: string | null;
  description: string;
  severity: string | null;
  occurred_at: string;
};

export async function listSymptoms(): Promise<Symptom[]> {
  return apiRequest<Symptom[]>("/api/v1/symptoms", { token: getAccessToken });
}
