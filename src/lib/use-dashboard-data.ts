"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAccounts,
  fetchAttendanceByGender,
  fetchGremialBenchmarks,
  fetchNightlyAttendance,
  fetchSalesByNight,
  fetchVenues,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  DEMO_ACCOUNTS,
  DEMO_ATTENDANCE,
  DEMO_BENCH,
  DEMO_EMPTY_ATTENDANCE,
  DEMO_EMPTY_SALES,
  DEMO_GENDER,
  DEMO_SALES,
  DEMO_VENUES,
} from "@/lib/demo-data";
import { useFilters, type GenderFilter } from "@/lib/filters";
import {
  formatPeriodRange,
  pivotAttendanceByNight,
  pivotSalesByNight,
  sectorDeltaPercent,
  sumOrders,
  sumRedeemed,
  sumRevenueCents,
} from "@/lib/metrics";
import { copy } from "@/copy";
import {
  ApiError,
  type AccountOut,
  type AttendanceMeasure,
  type GenderMeasure,
  type GremialBenchmarks,
  type SalesMeasure,
  type VenueOut,
} from "@/lib/types";

export type Vista = "datos" | "vacio" | "carga" | "error";

export function readVista(raw: string | null): Vista {
  if (raw === "vacio" || raw === "carga" || raw === "error") return raw;
  return "datos";
}

function deltaHint(own: number | null, sector: number | null): {
  text: string;
  tone: "up" | "down" | "muted";
} {
  const pct = sectorDeltaPercent(own, sector);
  if (pct == null || sector == null) {
    return { text: copy.dashboard.sector.hint, tone: "muted" };
  }
  const abs = Math.abs(pct).toLocaleString("es-CO", { maximumFractionDigits: 0 });
  if (pct >= 0) {
    return { text: copy.dashboard.kpis.vsSectorAbove(abs), tone: "up" };
  }
  return { text: copy.dashboard.kpis.vsSectorBelow(abs), tone: "down" };
}

export function useDashboardData(vista: Vista = "datos") {
  const { token, me, ready, isSuperAdmin, isDemo, logout } = useAuth();
  const {
    period,
    accountId,
    venueId,
    gender,
    toggleVenueId,
    toggleGender,
    clear,
    hasActiveFilters,
  } = useFilters();
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountOut[]>([]);
  const [venues, setVenues] = useState<VenueOut[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMeasure | null>(null);
  const [sales, setSales] = useState<SalesMeasure | null>(null);
  const [genderMeasure, setGenderMeasure] = useState<GenderMeasure | null>(null);
  const [bench, setBench] = useState<GremialBenchmarks | null>(null);
  const [bootLoading, setBootLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMetricsRef = useRef(false);

  const signedIn = Boolean(token || isDemo);
  const showClientPicker = me?.role === "super_admin" && isSuperAdmin;

  const applyDemo = useCallback((mode: Vista) => {
    setAccounts(DEMO_ACCOUNTS);
    setVenues(DEMO_VENUES);
    setBench(DEMO_BENCH);
    setGenderMeasure(DEMO_GENDER);
    if (mode === "vacio") {
      setAttendance(DEMO_EMPTY_ATTENDANCE);
      setSales(DEMO_EMPTY_SALES);
      setError(null);
    } else if (mode === "error") {
      setAttendance(null);
      setSales(null);
      setError(copy.errors.metrics);
    } else {
      setAttendance(DEMO_ATTENDANCE);
      setSales(DEMO_SALES);
      setError(null);
    }
    hasMetricsRef.current = true;
    setBootLoading(mode === "carga");
    setRefreshing(false);
  }, []);

  const load = useCallback(async () => {
    if (!me) return;
    if (isDemo) {
      applyDemo(vista);
      return;
    }
    if (!token) return;
    const soft = hasMetricsRef.current;
    if (soft) setRefreshing(true);
    else setBootLoading(true);
    setError(null);
    try {
      const query = {
        period,
        accountId: showClientPicker ? accountId : undefined,
        venueId,
        gender,
      };

      const tasks: Promise<unknown>[] = [
        fetchNightlyAttendance(token, query),
        fetchSalesByNight(token, query),
        fetchAttendanceByGender(token, query),
        fetchGremialBenchmarks(token, period),
        fetchVenues(token, showClientPicker ? accountId : undefined),
      ];
      if (showClientPicker) tasks.push(fetchAccounts(token));

      const results = await Promise.all(tasks);
      setAttendance(results[0] as AttendanceMeasure);
      setSales(results[1] as SalesMeasure);
      setGenderMeasure(results[2] as GenderMeasure);
      setBench(results[3] as GremialBenchmarks);
      setVenues(results[4] as VenueOut[]);
      if (showClientPicker) setAccounts(results[5] as AccountOut[]);
      else setAccounts([]);
      hasMetricsRef.current = true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : copy.errors.metrics);
    } finally {
      setBootLoading(false);
      setRefreshing(false);
    }
  }, [
    token,
    me,
    isDemo,
    vista,
    applyDemo,
    period,
    accountId,
    venueId,
    gender,
    showClientPicker,
    logout,
    router,
  ]);

  useEffect(() => {
    if (ready && !signedIn) router.replace("/login");
  }, [ready, signedIn, router]);

  useEffect(() => {
    if (ready && signedIn && me) void load();
  }, [ready, signedIn, me, load]);

  const venueNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const venue of venues) map[venue.venue_id] = venue.name;
    return map;
  }, [venues]);

  const attendancePoints = useMemo(() => {
    if (!attendance) return [];
    return venueId ? attendance.points.filter((point) => point.venue_id === venueId) : attendance.points;
  }, [attendance, venueId]);

  const salesPoints = useMemo(() => {
    if (!sales) return [];
    return venueId ? sales.points.filter((point) => point.venue_id === venueId) : sales.points;
  }, [sales, venueId]);

  const attendancePivot = useMemo(() => {
    if (!attendance) return null;
    const pivot = pivotAttendanceByNight(attendancePoints);
    const venueLabels = { ...pivot.venueLabels };
    for (const [key, id] of Object.entries(pivot.venueIdByKey)) {
      if (venueNameById[id]) venueLabels[key] = venueNameById[id];
    }
    return { ...pivot, venueLabels };
  }, [attendance, attendancePoints, venueNameById]);

  const salesPivot = useMemo(() => {
    if (!sales) return null;
    const pivot = pivotSalesByNight(salesPoints);
    const venueLabels = { ...pivot.venueLabels };
    for (const [key, id] of Object.entries(pivot.venueIdByKey)) {
      if (venueNameById[id]) venueLabels[key] = venueNameById[id];
    }
    return { ...pivot, venueLabels };
  }, [sales, salesPoints, venueNameById]);

  const tickets = attendance ? sumRedeemed(attendancePoints) : 0;
  const orders = sales ? sumOrders(salesPoints) : 0;
  const revenueCents = sales ? sumRevenueCents(salesPoints) : 0;
  const periodLabel = formatPeriodRange(period.start, period.end);
  const scopeLabel = showClientPicker
    ? accountId
      ? (accounts.find((account) => account.id === accountId)?.name ?? copy.dashboard.scopeClient)
      : copy.dashboard.scopeGlobal
    : (me?.account_name ?? copy.dashboard.scopeBusiness);

  const empty =
    !bootLoading &&
    !refreshing &&
    !error &&
    attendance &&
    sales &&
    (attendance.points.length === 0 ||
      attendance.data_quality === "missing" ||
      sales.points.length === 0 ||
      sales.data_quality === "missing");

  const nightsCount = attendancePivot?.rows.length ?? 0;
  const venueCount = Math.max(
    new Set(attendancePoints.map((point) => point.venue_id)).size || venues.length || 1,
    1,
  );
  const avgAttendance = nightsCount > 0 ? tickets / venueCount / nightsCount : null;
  const avgOrders = nightsCount > 0 ? orders / venueCount / nightsCount : null;
  const attendanceDelta = deltaHint(avgAttendance, bench?.avg_tickets_per_venue_night ?? null);
  const ordersDelta = deltaHint(avgOrders, bench?.avg_orders_per_venue_night ?? null);

  const onToggleGender = (g: string) => {
    toggleGender(g as NonNullable<GenderFilter>);
  };

  return {
    ready,
    signedIn,
    me,
    isDemo,
    isSuperAdmin,
    showClientPicker,
    accounts,
    venues,
    attendance,
    sales,
    genderMeasure,
    bench,
    bootLoading,
    refreshing,
    error,
    load,
    venueId,
    gender,
    toggleVenueId,
    clear,
    hasActiveFilters,
    attendancePivot,
    salesPivot,
    tickets,
    orders,
    revenueCents,
    periodLabel,
    scopeLabel,
    empty,
    avgAttendance,
    avgOrders,
    attendanceDelta,
    ordersDelta,
    onToggleGender,
  };
}
