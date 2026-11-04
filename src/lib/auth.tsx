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
import { copy } from "@/copy";
import { fetchMe, login as apiLogin } from "./api";
import { demoProfile } from "./demo-data";
import { ApiError, type MeResponse } from "./types";

const TOKEN_KEY = "da_access_token";
const DEMO_KEY = "da_demo";
const DEMO_ROLE_KEY = "da_demo_role";

export const DEMO_ROLES = ["super_admin", "collective", "account_owner"] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

function readDemoRole(): DemoRole {
  try {
    const stored = localStorage.getItem(DEMO_ROLE_KEY);
    if (stored && DEMO_ROLES.includes(stored as DemoRole)) return stored as DemoRole;
  } catch {
    /* ignore */
  }
  return "super_admin";
}

type AuthContextValue = {
  token: string | null;
  me: MeResponse | null;
  ready: boolean;
  isSuperAdmin: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  enterDemo: (role?: string) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemoFlag(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const refreshMe = useCallback(async () => {
    if (readDemoFlag()) {
      setIsDemo(true);
      setMe(demoProfile(readDemoRole()));
      setToken(null);
      return;
    }
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
      if (readDemoFlag()) {
        setIsDemo(true);
        setMe(demoProfile(readDemoRole()));
        setToken(null);
        setReady(true);
        return;
      }
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
      localStorage.removeItem(DEMO_KEY);
      setIsDemo(false);
      const res = await apiLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      const profile = await fetchMe(res.access_token);
      setMe(profile);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        throw new ApiError(err.status, copy.errors.credentials);
      }
      throw err;
    }
  }, []);

  const enterDemo = useCallback((role = "super_admin") => {
    const profile = demoProfile(role);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(DEMO_KEY, "1");
      localStorage.setItem(DEMO_ROLE_KEY, profile.role);
    } catch {
      /* ignore */
    }
    setToken(null);
    setIsDemo(true);
    setMe(profile);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(DEMO_KEY);
      localStorage.removeItem(DEMO_ROLE_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setIsDemo(false);
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      me,
      ready,
      isSuperAdmin: me?.role === "super_admin",
      isDemo,
      login,
      enterDemo,
      logout,
      refreshMe,
    }),
    [token, me, ready, isDemo, login, enterDemo, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
