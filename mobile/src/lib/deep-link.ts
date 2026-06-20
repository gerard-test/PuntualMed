import { supabase } from "@/lib/supabase";

// Extrae el `code` del deep link de Supabase (flujo PKCE).
// `new URL` depende del polyfill de `react-native-url-polyfill` que se carga
// transitivamente al importar `@/lib/supabase`. Si ese import desaparece en
// una refactorizacion, `extractAuthCode` fallara silenciosamente en dispositivo.
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

