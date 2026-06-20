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

export type SymptomInput = {
  description: string;
  severity?: string | null;
  medication_id?: string | null;
};

export async function createSymptom(input: SymptomInput): Promise<Symptom> {
  return apiRequest<Symptom>("/api/v1/symptoms", {
    method: "POST",
    body: input,
    token: getAccessToken,
  });
}
