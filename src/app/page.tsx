"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "@phosphor-icons/react";
import { ChartBlock } from "@/brand/ChartBlock";
import { EmptyState } from "@/brand/EmptyState";
import { FilterBar } from "@/brand/FilterBar";
import { KpiCard } from "@/brand/KpiCard";
import { DashboardSkeleton } from "@/brand/Skeleton";
import { copy } from "@/copy";

const GenderMixChart = dynamic(
  () => import("@/brand/charts/GenderMixChart").then((m) => m.GenderMixChart),
  { ssr: false },
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
  formatCount,
  formatMoney,
  pivotAttendanceByNight,
  pivotSalesByNight,
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

type Vista = "datos" | "vacio" | "carga" | "error";

function readVista(raw: string | null): Vista {
  if (raw === "vacio" || raw === "carga" || raw === "error") return raw;
  return "datos";
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="page-wrap">
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
  const [bootLoading, setBootLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMetricsRef = useRef(false);

  const signedIn = Boolean(token || isDemo);

  useEffect(() => {
    if (ready && !signedIn) router.replace("/login");
  }, [ready, signedIn, router]);

  const showClientPicker = me?.role === "super_admin" && isSuperAdmin;

  const applyDemo = useCallback(
    (mode: Vista) => {
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
    },
    [],
  );

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
    if (ready && signedIn && me) void load();
  }, [ready, signedIn, me, load]);

  const venueNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of venues) map[v.venue_id] = v.name;
    return map;
  }, [venues]);

  const attendancePivot = useMemo(() => {
    if (!attendance) return null;
    const pivot = pivotAttendanceByNight(attendance.points);
    const venueLabels = { ...pivot.venueLabels };
    for (const [key, id] of Object.entries(pivot.venueIdByKey)) {
      if (venueNameById[id]) venueLabels[key] = venueNameById[id];
    }
    return { ...pivot, venueLabels };
  }, [attendance, venueNameById]);

  const salesPivot = useMemo(() => {
    if (!sales) return null;
    const pivot = pivotSalesByNight(sales.points);
    const venueLabels = { ...pivot.venueLabels };
    for (const [key, id] of Object.entries(pivot.venueIdByKey)) {
      if (venueNameById[id]) venueLabels[key] = venueNameById[id];
    }
    return { ...pivot, venueLabels };
  }, [sales, venueNameById]);

  if (!ready || !signedIn || !me) {
    return (
      <main className="page-wrap">
        <p className="page-kicker">{copy.loading}</p>
        <DashboardSkeleton />
      </main>
    );
  }

  const tickets = attendance ? sumRedeemed(attendance.points) : 0;
  const orders = sales ? sumOrders(sales.points) : 0;
  const revenue = sales ? sumRevenueCents(sales.points) : 0;
  const source = attendance?.data_source ?? sales?.data_source ?? "—";
  const scopeLabel = showClientPicker
    ? accountId
      ? accounts.find((a) => a.id === accountId)?.name ?? copy.dashboard.scopeClient
      : copy.dashboard.scopeGlobal
    : me.account_name ?? copy.dashboard.scopeBusiness;

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
  const avgAttendance = nightsCount > 0 ? tickets / Math.max(venues.length || 1, 1) / nightsCount : null;
  const avgOrders = nightsCount > 0 ? orders / Math.max(venues.length || 1, 1) / nightsCount : null;

  const onToggleGender = (g: string) => {
    toggleGender(g as NonNullable<GenderFilter>);
  };

  return (
    <main className="page-wrap">
      <p className="page-kicker">{copy.dashboard.kicker}</p>
      <h1 className="page-title">{copy.dashboard.title}</h1>
      <p className="page-lead">
        {isSuperAdmin
          ? copy.dashboard.introAdmin
          : copy.dashboard.introOwner(me.account_name ?? copy.dashboard.scopeBusiness)}
      </p>
      <div className="meta-row">
        <span>
          {period.start} → {period.end}
        </span>
        <span>{scopeLabel}</span>
        <span>{source}</span>
        {refreshing ? <span>{copy.refreshing}</span> : null}
      </div>

      {isDemo ? (
        <p className="banner-demo" role="status" style={{ marginTop: "1.5rem" }}>
          <Info size={18} weight="regular" aria-hidden />
          <span>{copy.demo.banner}</span>
        </p>
      ) : (
        <div style={{ height: "1.5rem" }} />
      )}

      <FilterBar
        isSuperAdmin={Boolean(showClientPicker)}
        accounts={accounts}
        venues={venues}
      />

      {bootLoading ? <DashboardSkeleton /> : null}

      {error ? (
        <div className="surface-card" style={{ padding: "1.6rem", marginBottom: "2rem" }}>
          <p className="status-error font-glora" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
          <button type="button" className="btn-discover" onClick={() => void load()}>
            {copy.retry}
          </button>
        </div>
      ) : null}

      {!error && !bootLoading && attendance && sales ? (
        <div style={{ opacity: refreshing ? 0.72 : 1, transition: "opacity 160ms ease" }}>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <KpiCard label={copy.dashboard.kpis.revenue} value={formatMoney(revenue)} hint={scopeLabel} />
            <KpiCard
              label={copy.dashboard.kpis.attendance}
              value={formatCount(tickets)}
              hint={scopeLabel}
            />
            <KpiCard label={copy.dashboard.kpis.orders} value={formatCount(orders)} hint={scopeLabel} />
          </section>

          {bench ? (
            <section className="surface-card" style={{ padding: "1.5rem 1.4rem", marginBottom: "1.5rem" }}>
              <h2
                className="font-glora"
                style={{
                  color: "var(--color-ink)",
                  fontSize: "var(--step-lead)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: "0 0 0.4rem",
                }}
              >
                {copy.dashboard.sector.title}
              </h2>
              <p
                className="font-glora"
                style={{
                  color: "var(--color-muted)",
                  margin: "0 0 1.2rem",
                  fontSize: "var(--step-small)",
                  lineHeight: 1.5,
                }}
              >
                {copy.dashboard.sector.note}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                  gap: "1rem",
                }}
              >
                <KpiCard
                  label={copy.dashboard.sector.attendance}
                  value={fmtNum(avgAttendance ?? bench.avg_tickets_per_venue_night)}
                  hint={`${copy.dashboard.sector.hint}: ${fmtNum(bench.avg_tickets_per_venue_night)}`}
                />
                <KpiCard
                  label={copy.dashboard.sector.orders}
                  value={fmtNum(avgOrders ?? bench.avg_orders_per_venue_night)}
                  hint={`${copy.dashboard.sector.hint}: ${fmtNum(bench.avg_orders_per_venue_night)}`}
                />
              </div>
            </section>
          ) : null}

          {empty ? (
            <EmptyState
              title={copy.dashboard.empty.title}
              body={copy.dashboard.empty.body}
              action={
                <button type="button" className="btn-discover" onClick={() => void load()}>
                  {copy.retry}
                </button>
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
                  {gender ? (
                    <p
                      className="font-glora"
                      style={{
                        color: "var(--color-muted)",
                        margin: "0 0 1rem",
                        fontSize: "var(--step-small)",
                        lineHeight: 1.5,
                      }}
                    >
                      {copy.dashboard.salesGenderNote}
                    </p>
                  ) : null}
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
            </>
          )}
        </div>
      ) : null}
    </main>
  );
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
