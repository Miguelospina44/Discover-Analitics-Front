"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMe, login as apiLogin } from "./api";
import { ApiError, type MeResponse } from "./types";

const TOKEN_KEY = "da_access_token";

type AuthContextValue = {
  token: string | null;
  me: MeResponse | null;
  ready: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);

  const refreshMe = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setMe(null);
      return;
    }
    try {
      const profile = await fetchMe(t);
      setMe(profile);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setMe(null);
    }
  }, []);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      setToken(t);
      if (t) {
        void fetchMe(t)
          .then(setMe)
          .catch(() => {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setMe(null);
          })
          .finally(() => setReady(true));
      } else {
        setReady(true);
      }
    } catch {
      setToken(null);
      setReady(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      const profile = await fetchMe(res.access_token);
      setMe(profile);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        throw new ApiError(err.status, "Ese correo o clave no cuadran.");
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      me,
      ready,
      isSuperAdmin: me?.role === "super_admin",
      login,
      logout,
      refreshMe,
    }),
    [token, me, ready, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
