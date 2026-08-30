import { useCallback, useEffect, useState } from "react";
import { ApiUser, apiBaseUrl, authApi } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState<ApiUser | null>(null); const [loading, setLoading] = useState(Boolean(apiBaseUrl)); const [error, setError] = useState("");
  useEffect(() => { if (!apiBaseUrl) return; authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const authenticate = useCallback(async (action: () => Promise<{ user: ApiUser }>) => { setError(""); setLoading(true); try { const result = await action(); setUser(result.user); } catch (cause) { setError(cause instanceof Error ? cause.message : "Authentication failed."); } finally { setLoading(false); } }, []);
  const logout = useCallback(async () => { await authApi.logout().catch(() => undefined); setUser(null); }, []);
  return { user, loading, error, login: (email: string, password: string) => authenticate(() => authApi.login(email, password)), register: (email: string, password: string, displayName: string) => authenticate(() => authApi.register(email, password, displayName)), logout };
}

