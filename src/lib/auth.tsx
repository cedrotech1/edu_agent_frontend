import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type AuthUser,
  type UserRole,
  ApiError,
} from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    institution?: string;
    schoolIds: number[];
    primarySchoolId?: number;
    role: UserRole;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<AuthUser | null>;
  setSession: (token: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function roleHome(role?: string | null): string {
  if (role === "student") return "/student";
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/login";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    const normalized = { ...nextUser, name: nextUser.name || (nextUser as any).names || "" };
    setToken(nextToken);
    setStoredUser(normalized);
    setTokenState(nextToken);
    setUser(getStoredUser() || normalized);
  }, []);

  const refreshMe = useCallback(async () => {
    const existing = getToken();
    if (!existing) {
      setUser(null);
      setTokenState(null);
      return null;
    }
    try {
      const res = await api.auth.me();
      const me = (res.user || res.data) as AuthUser;
      if (me) {
        setStoredUser(me);
        const stored = getStoredUser();
        setUser(stored);
        setTokenState(existing);
        return stored;
      }
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuth();
        setUser(null);
        setTokenState(null);
      }
      return getStoredUser();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        if (!cancelled) setLoading(false);
        return;
      }
      await refreshMe();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login(email, password);
      setSession(res.token, res.user);
      return res.user;
    },
    [setSession]
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      institution: string;
      role: UserRole;
    }) => {
      const res = await api.auth.register(payload);
      // Registration no longer returns token/user - user must verify email first
      return res;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (getToken()) await api.auth.logout();
    } catch {
      // ignore logout network errors
    } finally {
      clearAuth();
      setUser(null);
      setTokenState(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshMe,
      setSession,
    }),
    [user, token, loading, login, register, logout, refreshMe, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
