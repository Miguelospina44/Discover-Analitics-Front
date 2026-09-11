"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PERIOD, type Period } from "./types";

export type GenderFilter = "woman" | "man" | "other" | "undisclosed" | null;

export type FilterState = {
  period: Period;
  accountId: string | null;
  venueId: string | null;
  gender: GenderFilter;
};

type FiltersContextValue = FilterState & {
  setPeriod: (period: Period) => void;
  setAccountId: (id: string | null) => void;
  setVenueId: (id: string | null) => void;
  setGender: (g: GenderFilter) => void;
  toggleAccountId: (id: string) => void;
  toggleVenueId: (id: string) => void;
  toggleGender: (g: NonNullable<GenderFilter>) => void;
  clear: () => void;
  hasActiveFilters: boolean;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

const initial: FilterState = {
  period: { ...DEFAULT_PERIOD },
  accountId: null,
  venueId: null,
  gender: null,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>(initial.period);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderFilter>(null);

  const toggleAccountId = useCallback((id: string) => {
    setAccountId((prev) => (prev === id ? null : id));
  }, []);

  const toggleVenueId = useCallback((id: string) => {
    setVenueId((prev) => (prev === id ? null : id));
  }, []);

  const toggleGender = useCallback((g: NonNullable<GenderFilter>) => {
    setGender((prev) => (prev === g ? null : g));
  }, []);

  const clear = useCallback(() => {
    setPeriod({ ...DEFAULT_PERIOD });
    setAccountId(null);
    setVenueId(null);
    setGender(null);
  }, []);

  const hasActiveFilters =
    accountId != null ||
    venueId != null ||
    gender != null ||
    period.start !== DEFAULT_PERIOD.start ||
    period.end !== DEFAULT_PERIOD.end;

  const value = useMemo(
    () => ({
      period,
      accountId,
      venueId,
      gender,
      setPeriod,
      setAccountId,
      setVenueId,
      setGender,
      toggleAccountId,
      toggleVenueId,
      toggleGender,
      clear,
      hasActiveFilters,
    }),
    [
      period,
      accountId,
      venueId,
      gender,
      toggleAccountId,
      toggleVenueId,
      toggleGender,
      clear,
      hasActiveFilters,
    ],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
