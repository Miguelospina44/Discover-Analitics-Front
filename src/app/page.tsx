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
import { Landing } from "@/brand/Landing";

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
      setError(
        err instanceof ApiError
          ? err.message
          : "No pudimos traer las métricas. Reintentá en un toque.",
      );
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

  // Public landing: unauthenticated visitors see the marketing page at "/",
  // authenticated users keep the hub below.
  if (ready && !token) {
    return <Landing />;
  }

  if (!ready || !token || !me) {
    return (
      <main style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p className="font-glora-l" style={{ color: "var(--discover-storm)" }}>
          Cargando el parche…
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
      ? accounts.find((a) => a.id === accountId)?.name ?? "cliente"
      : "global"
    : me.account_name ?? "tu club";

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
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <section style={{ marginBottom: "1.5rem" }}>
        <DiscoverLogo variant="primary" />
        <p
          className="font-glora-l"
          style={{
            color: "var(--discover-ink-soft)",
            maxWidth: 560,
            marginTop: "1.25rem",
            fontSize: "1.05rem",
            lineHeight: 1.55,
            fontStyle: "italic",
            fontWeight: 300,
          }}
        >
          {isSuperAdmin
            ? "Vista gremial: todos los clientes y el pulso global."
            : `Tu parche: ${me.account_name ?? "cliente"}. Lo tuyo + el promedio anónimo del gremio.`}
        </p>
        <p className="font-glora-xl" style={{ color: "var(--discover-storm)", marginTop: "0.75rem" }}>
          {period.start} → {period.end}
          {" · "}
          <span style={{ color: "var(--discover-obsidian)", fontWeight: 400 }}>{scopeLabel}</span>
          {" · "}
          {source}
          {refreshing ? " · actualizando…" : ""}
        </p>
      </section>

      <FilterBar
        isSuperAdmin={Boolean(showClientPicker)}
        accounts={accounts}
        venues={venues}
      />

      {bootLoading && !attendance ? (
        <p className="font-glora-l" style={{ color: "var(--discover-storm)", marginBottom: "2rem" }}>
          Cargando el parche…
        </p>
      ) : null}

      {error ? (
        <div className="surface-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <p className="font-glora" style={{ color: "var(--discover-tomato)", marginBottom: "1rem" }}>
            {error}
          </p>
          <button type="button" className="btn-discover" onClick={() => void load()}>
            Reintentar
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
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            <KpiCard label="Tickets redimidos" value={String(tickets)} hint={scopeLabel} />
            <KpiCard label="Órdenes" value={String(orders)} hint={scopeLabel} />
            <KpiCard label="Revenue" value={formatMoney(revenue)} hint={scopeLabel} />
            <KpiCard
              label="% Mujer"
              value={pct(genderMeasure?.points.find((p) => p.gender === "woman")?.share)}
              hint={scopeLabel}
            />
            <KpiCard
              label="% Hombre"
              value={pct(genderMeasure?.points.find((p) => p.gender === "man")?.share)}
              hint={scopeLabel}
            />
          </section>

          {bench ? (
            <section className="surface-card" style={{ padding: "1.5rem 1.25rem", marginBottom: "1.75rem" }}>
              <h2
                className="font-blogh"
                style={{ color: "var(--discover-obsidian)", fontSize: "0.95rem", margin: "0 0 0.5rem" }}
              >
                El parche gremial
              </h2>
              <p className="font-glora-xl" style={{ color: "var(--discover-storm)", margin: "0 0 1.25rem", fontSize: "0.8rem" }}>
                {bench.note}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
                  gap: "1rem",
                }}
              >
                <KpiCard
                  label="Avg tickets / noche"
                  value={fmtNum(bench.avg_tickets_per_venue_night)}
                  hint="anónimo"
                />
                <KpiCard
                  label="Mediana tickets"
                  value={fmtNum(bench.median_tickets_per_venue_night)}
                  hint="anónimo"
                />
                <KpiCard
                  label="Avg órdenes / noche"
                  value={fmtNum(bench.avg_orders_per_venue_night)}
                  hint="anónimo"
                />
                <KpiCard
                  label="Cuentas en muestra"
                  value={String(bench.accounts_in_sample)}
                  hint={`${bench.nights_in_sample} noches`}
                />
                <KpiCard label="Gremial % Mujer" value={pct(bench.share_woman)} hint="anónimo" />
                <KpiCard label="Gremial % Hombre" value={pct(bench.share_man)} hint="anónimo" />
              </div>
            </section>
          ) : null}

          {empty ? (
            <EmptyState
              title="Aquí va a estar el parche"
              body="Cuando haya data del estudio, los hallazgos salen acá."
              action={
                <button type="button" className="btn-discover" onClick={() => void load()}>
                  Reintentar
                </button>
              }
            />
          ) : (
            <>
              {genderMeasure && genderMeasure.points.length > 0 ? (
                <ChartBlock title={genderMeasure.title} definition={genderMeasure.definition}>
                  <GenderMixChart
                    points={genderMeasure.points}
                    activeGender={gender}
                    onToggleGender={onToggleGender}
                  />
                </ChartBlock>
              ) : null}
              {attendancePivot ? (
                <ChartBlock title={attendance.title} definition={attendance.definition}>
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
                  title={sales.title}
                  definition={
                    gender
                      ? `${sales.definition} Ventas aún sin dimensión de género.`
                      : sales.definition
                  }
                >
                  {gender ? (
                    <p
                      className="font-glora-xl"
                      style={{
                        color: "var(--discover-storm)",
                        margin: "0 0 1rem",
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                      }}
                    >
                      Ventas aún sin dimensión de género — el filtro de género no aplica a este
                      visual.
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
  return n.toFixed(1);
}

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(0)}%`;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="surface-card" style={{ padding: "1.25rem 1.1rem", minWidth: 0 }}>
      <div className="kpi-label" style={{ marginBottom: "0.65rem", fontSize: "0.75rem" }}>
        {label}
      </div>
      <div
        className="kpi-number"
        title={value}
        style={{ fontSize: value.length > 10 ? "1.15rem" : "clamp(1.35rem, 3.5vw, 1.85rem)" }}
      >
        {value}
      </div>
      <div
        className="font-glora-xl"
        style={{
          marginTop: "0.5rem",
          fontSize: "0.8rem",
          color: "var(--discover-storm)",
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
    <section className="surface-card" style={{ padding: "1.5rem 1.25rem", marginBottom: "1.75rem" }}>
      <h2
        className="font-blogh"
        style={{ color: "var(--discover-obsidian)", fontSize: "0.95rem", margin: "0 0 0.5rem" }}
      >
        {title}
      </h2>
      <p
        className="font-glora-xl"
        style={{ color: "var(--discover-storm)", margin: "0 0 1.25rem", fontSize: "0.8rem" }}
      >
        {definition}
      </p>
      {children}
    </section>
  );
}
