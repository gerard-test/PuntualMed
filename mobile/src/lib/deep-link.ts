import { supabase } from "@/lib/supabase";

// Extrae el `code` del deep link de Supabase (flujo PKCE).
// Usa URL nativa para evitar dependencias nativas en los tests.
export function extractAuthCode(url: string): string | null {
  try {
    const code = new URL(url).searchParams.get("code");
    return code ?? null;
  } catch {
    return null;
  }
}

// Si el deep link trae un code, lo intercambia por una sesion activa.
export async function createSessionFromUrl(url: string): Promise<void> {
  const code = extractAuthCode(url);
  if (!code) return;
  await supabase.auth.exchangeCodeForSession(code);
}

