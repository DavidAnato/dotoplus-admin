import { useEffect, ReactNode } from "react";
import { setSessionExpiredHandler } from "./api";
import { useAppStore, type AdminUser } from "./store/appStore";

export type User = AdminUser;

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const loading = useAppStore((s) => s.authLoading);
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);
  return { user, loading, login, logout };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const bootstrapAuth = useAppStore((s) => s.bootstrapAuth);
  const hydrateTheme = useAppStore((s) => s.hydrateTheme);
  const sessionExpired = useAppStore((s) => s.sessionExpired);
  const setOnline = useAppStore((s) => s.setOnline);

  useEffect(() => {
    hydrateTheme();
    bootstrapAuth();
  }, [bootstrapAuth, hydrateTheme]);

  useEffect(() => {
    setSessionExpiredHandler((msg) => sessionExpired(msg));
    return () => setSessionExpiredHandler(null);
  }, [sessionExpired]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [setOnline]);

  return <>{children}</>;
}
