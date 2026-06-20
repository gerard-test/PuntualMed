import type { SymptomInput } from "@/lib/symptoms-api";

export const SEVERITIES = ["leve", "moderado", "severo"] as const;

export type SymptomForm = {
  description: string;
  severity: string;
  medicationId: string;
};

// Devuelve un mensaje de error o null si el formulario es valido.
export function validateSymptomForm(form: SymptomForm): string | null {
  if (!form.description.trim()) return "La descripcion es obligatoria";
  return null;
}

export function toSymptomInput(form: SymptomForm): SymptomInput {
  return {
    description: form.description.trim(),
    severity: form.severity,
    medication_id: form.medicationId === "" ? null : form.medicationId,
  };
}
