"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/brand/EmptyState";
import { DiscoverLogo } from "@/brand/DiscoverLogo";
import { FilterBar } from "@/brand/FilterBar";
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

export default function HomePage() {
  const { token, me, ready, isSuperAdmin, logout } = useAuth();
  const {
    period,
    accountId,
    venueId,
    gender,
    toggleVenueId,
    toggleGender,
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

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  const showClientPicker = me?.role === "super_admin" && isSuperAdmin;

  const load = useCallback(async () => {
    if (!token || !me) return;
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
    period,
    accountId,
    venueId,
    gender,
    showClientPicker,
    logout,
    router,
  ]);

  useEffect(() => {
    if (ready && token && me) void load();
  }, [ready, token, me, load]);

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

  if (!ready || !token || !me) {
    return (
      <main style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p className="font-glora-l" style={{ color: "var(--discover-cloud)" }}>
          {copy.loading}
        </p>
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

  const onToggleGender = (g: string) => {
    toggleGender(g as NonNullable<GenderFilter>);
  };

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "2.75rem 1.5rem 4.5rem" }}>
      <section style={{ marginBottom: "1.75rem" }}>
        <DiscoverLogo variant="primary" />
        <p
          className="font-glora-l"
          style={{
            color: "var(--discover-cloud)",
            maxWidth: 640,
            marginTop: "1.15rem",
            fontSize: "1.05rem",
            lineHeight: 1.55,
            fontWeight: 300,
          }}
        >
          {isSuperAdmin
            ? copy.dashboard.introAdmin
            : copy.dashboard.introOwner(me.account_name ?? copy.dashboard.scopeBusiness)}
        </p>
        <p
          className="font-glora-xl"
          style={{ color: "var(--discover-cloud)", marginTop: "0.85rem", fontSize: "0.85rem" }}
        >
          {period.start} → {period.end}
          {" · "}
          <span style={{ color: "var(--discover-pearl)", fontWeight: 400 }}>{scopeLabel}</span>
          {" · "}
          {source}
          {refreshing ? ` · ${copy.refreshing}` : ""}
        </p>
      </section>

      <FilterBar
        isSuperAdmin={Boolean(showClientPicker)}
        accounts={accounts}
        venues={venues}
      />

      {bootLoading && !attendance ? (
        <p className="font-glora-l" style={{ color: "var(--discover-cloud)", marginBottom: "2rem" }}>
          {copy.loading}
        </p>
      ) : null}

      {error ? (
        <div className="surface-card" style={{ padding: "1.6rem", marginBottom: "2rem" }}>
          <p className="font-glora" style={{ color: "var(--discover-terracotta)", marginBottom: "1rem" }}>
            {error}
          </p>
          <button type="button" className="btn-discover" onClick={() => void load()}>
            {copy.retry}
          </button>
        </div>
      ) : null}

      {!error && attendance && sales ? (
        <div
          className={refreshing ? "metrics-refreshing" : undefined}
          style={{ opacity: refreshing ? 0.72 : 1, transition: "opacity 120ms ease" }}
        >
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 168px), 1fr))",
              gap: "1rem",
              marginBottom: "2.25rem",
            }}
          >
            <KpiCard label={copy.dashboard.kpis.attendance} value={formatCount(tickets)} hint={scopeLabel} />
            <KpiCard label={copy.dashboard.kpis.orders} value={formatCount(orders)} hint={scopeLabel} />
            <KpiCard label={copy.dashboard.kpis.revenue} value={formatMoney(revenue)} hint={scopeLabel} />
            <KpiCard
              label={copy.dashboard.kpis.women}
              value={pct(genderMeasure?.points.find((p) => p.gender === "woman")?.share)}
              hint={scopeLabel}
            />
            <KpiCard
              label={copy.dashboard.kpis.men}
              value={pct(genderMeasure?.points.find((p) => p.gender === "man")?.share)}
              hint={scopeLabel}
            />
          </section>

          {bench ? (
            <section className="surface-card" style={{ padding: "1.6rem 1.4rem", marginBottom: "1.75rem" }}>
              <h2
                className="font-blogh"
                style={{ color: "var(--discover-pearl)", fontSize: "0.88rem", margin: "0 0 0.55rem" }}
              >
                {copy.dashboard.sector.title}
              </h2>
              <p
                className="font-glora-xl"
                style={{ color: "var(--discover-cloud)", margin: "0 0 1.35rem", fontSize: "0.85rem", lineHeight: 1.5 }}
              >
                {copy.dashboard.sector.note}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 148px), 1fr))",
                  gap: "1rem",
                }}
              >
                <KpiCard
                  label={copy.dashboard.sector.avgAttendance}
                  value={fmtNum(bench.avg_tickets_per_venue_night)}
                  hint={copy.dashboard.sector.hint}
                />
                <KpiCard
                  label={copy.dashboard.sector.medianAttendance}
                  value={fmtNum(bench.median_tickets_per_venue_night)}
                  hint={copy.dashboard.sector.hint}
                />
                <KpiCard
                  label={copy.dashboard.sector.avgOrders}
                  value={fmtNum(bench.avg_orders_per_venue_night)}
                  hint={copy.dashboard.sector.hint}
                />
                <KpiCard
                  label={copy.dashboard.sector.sample}
                  value={formatCount(bench.accounts_in_sample)}
                  hint={copy.dashboard.sector.nightsHint(bench.nights_in_sample)}
                />
                <KpiCard
                  label={copy.dashboard.sector.women}
                  value={pct(bench.share_woman)}
                  hint={copy.dashboard.sector.hint}
                />
                <KpiCard
                  label={copy.dashboard.sector.men}
                  value={pct(bench.share_man)}
                  hint={copy.dashboard.sector.hint}
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
              {genderMeasure && genderMeasure.points.length > 0 ? (
                <ChartBlock title={copy.charts.gender.title} definition={copy.charts.gender.definition}>
                  <GenderMixChart
                    points={genderMeasure.points}
                    activeGender={gender}
                    onToggleGender={onToggleGender}
                  />
                </ChartBlock>
              ) : null}
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
                      className="font-glora-xl"
                      style={{
                        color: "var(--discover-cloud)",
                        margin: "0 0 1rem",
                        fontSize: "0.85rem",
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

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(0)}%`;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="surface-card" style={{ padding: "1.3rem 1.15rem", minWidth: 0 }}>
      <div className="kpi-label" style={{ marginBottom: "0.7rem" }}>
        {label}
      </div>
      <div
        className="kpi-number"
        title={value}
        style={{ fontSize: value.length > 10 ? "1.2rem" : "clamp(1.45rem, 3.5vw, 1.95rem)" }}
      >
        {value}
      </div>
      <div
        className="font-glora-xl"
        style={{
          marginTop: "0.55rem",
          fontSize: "0.75rem",
          color: "var(--discover-cloud)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {hint}
      </div>
    </article>
  );
}

function ChartBlock({
  title,
  definition,
  children,
}: {
  title: string;
  definition: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-card" style={{ padding: "1.6rem 1.4rem", marginBottom: "1.75rem" }}>
      <h2
        className="font-blogh"
        style={{ color: "var(--discover-pearl)", fontSize: "0.88rem", margin: "0 0 0.55rem" }}
      >
        {title}
      </h2>
      <p
        className="font-glora-xl"
        style={{ color: "var(--discover-cloud)", margin: "0 0 1.35rem", fontSize: "0.85rem", lineHeight: 1.5 }}
      >
        {definition}
      </p>
      {children}
    </section>
  );
}
