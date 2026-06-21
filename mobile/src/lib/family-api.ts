import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/supabase";

export type FamilyContact = { id: string; display_name: string | null; created_at: string };
export type FamilyLink = { deep_link: string; expires_at: string };

export async function createFamilyLink(): Promise<FamilyLink> {
  return apiRequest<FamilyLink>("/api/v1/family/link", { method: "POST", token: getAccessToken });
}

export async function listFamilyContacts(): Promise<FamilyContact[]> {
  return apiRequest<FamilyContact[]>("/api/v1/family/contacts", { token: getAccessToken });
}

export async function deleteFamilyContact(id: string): Promise<void> {
  await apiRequest<null>(`/api/v1/family/contacts/${id}`, { method: "DELETE", token: getAccessToken });
}
