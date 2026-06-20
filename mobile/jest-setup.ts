// RNTL registra sus matchers de Jest automaticamente via el preset; no se requiere import de extend-expect.
export {};

process.env.EXPO_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.EXPO_PUBLIC_API_BASE_URL ||= "http://test.local";
