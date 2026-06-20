import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { createSessionFromUrl } from "@/lib/deep-link";

type Route = "/login" | "/home" | "/update-password" | null;

// Decision pura de redireccion segun sesion, recuperacion y grupo de ruta actual.
export function nextRoute(opts: {
  hasSession: boolean;
  loading: boolean;
  recovery: boolean;
  inAuth: boolean;
  inApp: boolean;
}): Route {
  if (opts.loading) return null;
  if (opts.recovery) return "/update-password";
  if (!opts.hasSession && !opts.inAuth) return "/login";
  if (opts.hasSession && !opts.inApp) return "/home";
  return null;
}

type AuthValue = {
  session: Session | null;
  loading: boolean;
  recovery: boolean;
  clearRecovery: () => void;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  loading: true,
  recovery: false,
  clearRecovery: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  const clearRecovery = () => setRecovery(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    }).finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });

    // Deep links: link inicial (app cerrada) + mientras esta abierta.
    Linking.getInitialURL().then((url) => {
      if (url) createSessionFromUrl(url);
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      createSessionFromUrl(url);
    });

    return () => {
      data.subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, recovery, clearRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}
