"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, WarningCircle } from "@phosphor-icons/react";
import { ChartBlock } from "@/brand/ChartBlock";
import { EmptyState } from "@/brand/EmptyState";
import { FilterBar } from "@/brand/FilterBar";
import { KpiStat } from "@/brand/KpiStat";
import { SectorCompare } from "@/brand/SectorCompare";
import { ChartSkeleton, DashboardSkeleton } from "@/brand/Skeleton";
import type { AudiencePanelState } from "@/brand/AudienceGenderAgeBlock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/copy";

const GenderMixChart = dynamic(
  () => import("@/brand/charts/GenderMixChart").then((m) => m.GenderMixChart),
  { ssr: false },
);
const AudienceGenderAgeBlock = dynamic(
  () => import("@/brand/AudienceGenderAgeBlock").then((m) => m.AudienceGenderAgeBlock),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
const NightlyAttendanceChart = dynamic(
  () =>
    import("@/brand/charts/NightlyAttendanceChart").then((m) => m.NightlyAttendanceChart),
  { ssr: false },
);
const SalesByNightChart = dynamic(
  () => import("@/brand/charts/SalesByNightChart").then((m) => m.SalesByNightChart),
  { ssr: false },
);
import {
  fetchAccounts,
  fetchAttendanceByGender,
  fetchAudienceByGenderAgeOrFallback,
  fetchGremialBenchmarks,
  fetchNightlyAttendance,
  fetchSalesByNight,
  fetchVenues,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  DEMO_ACCOUNTS,
  DEMO_ATTENDANCE,
  DEMO_AUDIENCE_GENDER_AGE,
  DEMO_AUDIENCE_GENDER_AGE_PRIVACY,
  DEMO_BENCH,
  DEMO_EMPTY_ATTENDANCE,
  DEMO_EMPTY_SALES,
  DEMO_GENDER,
  DEMO_SALES,
  DEMO_VENUES,
} from "@/lib/demo-data";
import { useFilters, type GenderFilter } from "@/lib/filters";
import {
  formatAverage,
  formatCount,
  formatPeriodRange,
  formatRevenueFromField,
  pivotAttendanceByNight,
  pivotSalesByNight,
  sectorDeltaPercent,
  sumOrders,
  sumRedeemed,
  sumRevenueCents,
} from "@/lib/metrics";
import {
  ApiError,
  type AccountOut,
  type AttendanceMeasure,
  type GenderMeasure,
  type GremialBenchmarks,
  type SalesMeasure,
  type VenueOut,
} from "@/lib/types";

type Vista = "datos" | "vacio" | "carga" | "error" | "privacidad" | "restringido";

function readVista(raw: string | null): Vista {
  if (
    raw === "vacio" ||
    raw === "carga" ||
    raw === "error" ||
    raw === "privacidad" ||
    raw === "restringido"
  ) {
    return raw;
  }
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

export default function Page() {
  return (
    <Suspense
      fallback={
        <main id="contenido" className="page-wrap" tabIndex={-1}>
          <DashboardSkeleton />
        </main>
      }
    >
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
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
  const searchParams = useSearchParams();
  const vista = readVista(searchParams.get("vista"));
  const [accounts, setAccounts] = useState<AccountOut[]>([]);
  const [venues, setVenues] = useState<VenueOut[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMeasure | null>(null);
  const [sales, setSales] = useState<SalesMeasure | null>(null);
  const [genderMeasure, setGenderMeasure] = useState<GenderMeasure | null>(null);
  const [bench, setBench] = useState<GremialBenchmarks | null>(null);
  const [audience, setAudience] = useState<AudiencePanelState>({ status: "loading" });
  const [bootLoading, setBootLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMetricsRef = useRef(false);
  const hasAudienceRef = useRef(false);

  const signedIn = Boolean(token || isDemo);

  useEffect(() => {
    if (ready && !signedIn) router.replace("/login");
  }, [ready, signedIn, router]);

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
    if (mode === "privacidad") {
      setAudience({ status: "ready", data: DEMO_AUDIENCE_GENDER_AGE_PRIVACY });
    } else if (mode === "restringido") {
      setAudience({ status: "restricted" });
    } else {
      setAudience({ status: "ready", data: DEMO_AUDIENCE_GENDER_AGE });
    }
    hasMetricsRef.current = true;
    hasAudienceRef.current = true;
    setBootLoading(mode === "carga");
    setRefreshing(false);
  }, []);

  const loadAudience = useCallback(async () => {
    if (!me || isDemo || !token) return;
    if (!hasAudienceRef.current) setAudience({ status: "loading" });
    try {
      const result = await fetchAudienceByGenderAgeOrFallback(token, {
        period,
        accountId: showClientPicker ? accountId : undefined,
        venueId,
      });
      if (result.status === "restricted") {
        setAudience({ status: "restricted" });
      } else {
        setAudience({ status: "ready", data: result.data });
      }
      hasAudienceRef.current = true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      setAudience({
        status: "error",
        message: err instanceof ApiError ? err.message : copy.charts.genderAge.error,
      });
    }
  }, [me, isDemo, token, period, showClientPicker, accountId, venueId, logout, router]);

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
    const audienceTask = loadAudience();
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
    await audienceTask;
  }, [
    token,
    me,
    isDemo,
    vista,
    applyDemo,
    loadAudience,
    period,
    accountId,
    venueId,
    gender,
    showClientPicker,
    logout,
    router,
  ]);

  useEffect(() => {
    if (ready && signedIn && me) void load();
  }, [ready, signedIn, me, load]);

  const venueNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of venues) map[v.venue_id] = v.name;
    return map;
  }, [venues]);

  const attendancePoints = useMemo(() => {
    if (!attendance) return [];
    return venueId ? attendance.points.filter((p) => p.venue_id === venueId) : attendance.points;
  }, [attendance, venueId]);

  const salesPoints = useMemo(() => {
    if (!sales) return [];
    return venueId ? sales.points.filter((p) => p.venue_id === venueId) : sales.points;
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

  if (!ready || !signedIn || !me) {
    return (
      <main id="contenido" className="page-wrap" tabIndex={-1}>
        <p className="page-kicker">{copy.loading}</p>
        <DashboardSkeleton />
      </main>
    );
  }

  const tickets = attendance ? sumRedeemed(attendancePoints) : 0;
  const orders = sales ? sumOrders(salesPoints) : 0;
  const revenueCents = sales ? sumRevenueCents(salesPoints) : 0;
  const periodLabel = formatPeriodRange(period.start, period.end);
  const scopeLabel = showClientPicker
    ? accountId
      ? (accounts.find((a) => a.id === accountId)?.name ?? copy.dashboard.scopeClient)
      : copy.dashboard.scopeGlobal
    : (me.account_name ?? copy.dashboard.scopeBusiness);

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
    new Set(attendancePoints.map((p) => p.venue_id)).size || venues.length || 1,
    1,
  );
  const avgAttendance = nightsCount > 0 ? tickets / venueCount / nightsCount : null;
  const avgOrders = nightsCount > 0 ? orders / venueCount / nightsCount : null;
  const attendanceDelta = deltaHint(avgAttendance, bench?.avg_tickets_per_venue_night ?? null);
  const ordersDelta = deltaHint(avgOrders, bench?.avg_orders_per_venue_night ?? null);

  const onToggleGender = (g: string) => {
    toggleGender(g as NonNullable<GenderFilter>);
  };

  return (
    <main id="contenido" className="page-wrap" tabIndex={-1} aria-label={copy.main}>
      <h1 className="page-title">{copy.dashboard.title}</h1>
      <p className="page-lead">
        {isSuperAdmin ? copy.dashboard.introAdmin : copy.dashboard.introOwner}
      </p>
      <div className="meta-row">
        <span>{periodLabel}</span>
        <span>{scopeLabel}</span>
        {refreshing ? <span>{copy.refreshing}</span> : null}
      </div>

      {isDemo ? (
        <Alert className="mt-6 mb-6" role="status">
          <Info size={16} weight="regular" aria-hidden />
          <AlertDescription>{copy.demo.banner}</AlertDescription>
        </Alert>
      ) : (
        <div className="h-6" />
      )}

      <FilterBar isSuperAdmin={Boolean(showClientPicker)} accounts={accounts} venues={venues} />

      {bootLoading ? <DashboardSkeleton /> : null}

      {error ? (
        <Alert variant="destructive" className="mb-8">
          <WarningCircle size={16} weight="regular" aria-hidden />
          <AlertDescription className="text-destructive">
            <span className="block mb-3">{error}</span>
            <Button type="button" onClick={() => void load()}>
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!error && !bootLoading && attendance && sales ? (
        <div className={refreshing ? "opacity-80 transition-opacity duration-[var(--dur-fast)]" : ""}>
          <section className="kpi-stage mb-10" aria-label={copy.dashboard.title}>
            <KpiStat
              hero
              label={copy.dashboard.kpis.revenue}
              value={formatRevenueFromField(revenueCents)}
              hint={periodLabel}
            />
            <KpiStat
              label={copy.dashboard.kpis.attendance}
              value={formatCount(tickets)}
              hint={
                avgAttendance != null
                  ? copy.dashboard.kpis.perNight(formatAverage(avgAttendance))
                  : periodLabel
              }
            />
            <KpiStat
              label={copy.dashboard.kpis.orders}
              value={formatCount(orders)}
              hint={
                avgOrders != null
                  ? copy.dashboard.kpis.perNight(formatAverage(avgOrders))
                  : periodLabel
              }
            />
          </section>

          {bench && !empty ? (
            <SectorCompare
              attendance={{
                label: copy.dashboard.sector.attendance,
                value: formatAverage(avgAttendance ?? bench.avg_tickets_per_venue_night),
                hint: attendanceDelta.text,
                tone: attendanceDelta.tone,
              }}
              orders={{
                label: copy.dashboard.sector.orders,
                value: formatAverage(avgOrders ?? bench.avg_orders_per_venue_night),
                hint: ordersDelta.text,
                tone: ordersDelta.tone,
              }}
            />
          ) : null}

          {empty ? (
            <EmptyState
              title={copy.dashboard.empty.title}
              body={copy.dashboard.empty.body}
              action={
                hasActiveFilters ? (
                  <Button type="button" variant="secondary" onClick={clear}>
                    {copy.filters.clear}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void load()}>
                    {copy.retry}
                  </Button>
                )
              }
            />
          ) : (
            <>
              {attendancePivot ? (
                <ChartBlock title={copy.charts.attendance.title} definition={copy.charts.attendance.definition}>
                  <NightlyAttendanceChart
                    rows={attendancePivot.rows}
                    venueKeys={attendancePivot.venueKeys}
                    venueLabels={attendancePivot.venueLabels}
                    venueIdByKey={attendancePivot.venueIdByKey}
                    activeVenueId={venueId}
                    onToggleVenue={toggleVenueId}
                  />
                </ChartBlock>
              ) : null}
              {salesPivot ? (
                <ChartBlock
                  title={copy.charts.sales.title}
                  definition={
                    gender
                      ? `${copy.charts.sales.definition} ${copy.dashboard.salesGenderNote}`
                      : copy.charts.sales.definition
                  }
                >
                  <SalesByNightChart
                    rows={salesPivot.rows}
                    venueKeys={salesPivot.venueKeys}
                    venueLabels={salesPivot.venueLabels}
                    venueIdByKey={salesPivot.venueIdByKey}
                    activeVenueId={venueId}
                    onToggleVenue={toggleVenueId}
                  />
                </ChartBlock>
              ) : null}
              {genderMeasure && genderMeasure.points.length > 0 ? (
                <ChartBlock title={copy.charts.gender.title} definition={copy.charts.gender.definition}>
                  <GenderMixChart
                    points={genderMeasure.points}
                    activeGender={gender}
                    onToggleGender={onToggleGender}
                  />
                </ChartBlock>
              ) : null}
              <AudienceGenderAgeBlock state={audience} onRetry={() => void loadAudience()} />
            </>
          )}
        </div>
      ) : null}
    </main>
  );
}
