"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Info, WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartBlock } from "@/brand/ChartBlock";
import { KpiStat } from "@/brand/KpiStat";
import { DashboardSkeleton } from "@/brand/Skeleton";
import { copy } from "@/copy";
import { useAuth } from "@/lib/auth";
import {
  fetchEventSubmissions,
  fetchEventSubmissionsSummary,
  type EventSubmissionsQuery,
} from "@/lib/api";
import { ApiError } from "@/lib/types";
import type { EventSubmission, EventSummaryResponse } from "@/lib/events-types";
import {
  applyEventFilters,
  bogotaYearMonth,
  countBy,
  splitCommitments,
  summarizeEventSubmissions,
  type EventListFilters,
} from "@/lib/events-aggregate";
import { DEMO_EVENT_LABEL, DEMO_NIGHT_LINES, demoEventsForRole } from "@/lib/events-demo-data";

const EventsBarChart = dynamic(
  () => import("@/brand/charts/EventsBarChart").then((m) => m.EventsBarChart),
  { ssr: false },
);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${MONTHS[+m - 1]} ${y}`;
}

function toChart(rows: { key: string; count: number }[], labelFn?: (key: string) => string) {
  return rows.map((row) => ({ label: labelFn ? labelFn(row.key) : row.key, value: row.count }));
}

export default function EventosPage() {
  const { token, me, isDemo, ready, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [collectiveFilter, setCollectiveFilter] = useState("");
  const [presaleFilter, setPresaleFilter] = useState("");
  const [commissionFilter, setCommissionFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [catalog, setCatalog] = useState<EventSubmission[]>([]);
  const [summaryFromApi, setSummaryFromApi] = useState<EventSummaryResponse | null>(null);
  const [usingFixture, setUsingFixture] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signedIn = Boolean(token || isDemo);
  const canView = me?.role === "super_admin" || me?.role === "collective";
  const isSuperAdmin = me?.role === "super_admin";

  const applyFixture = useCallback(() => {
    if (!me) return;
    setCatalog(demoEventsForRole(me.role, me.account_id));
    setSummaryFromApi(null);
    setUsingFixture(true);
    setError(null);
  }, [me]);

  const load = useCallback(async () => {
    if (!me || !canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (isDemo || !token) {
      applyFixture();
      setLoading(false);
      return;
    }

    const query: EventSubmissionsQuery = {};
    try {
      const [eventsRes, summaryRes] = await Promise.all([
        fetchEventSubmissions(token, query),
        fetchEventSubmissionsSummary(token, query),
      ]);
      if (eventsRes.is_demo || eventsRes.items.length === 0) {
        applyFixture();
      } else {
        setCatalog(eventsRes.items);
        setSummaryFromApi(summaryRes);
        setUsingFixture(false);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setCatalog([]);
        setError(copy.events.restricted);
        setUsingFixture(false);
      } else {
        applyFixture();
      }
    } finally {
      setLoading(false);
    }
  }, [token, isDemo, canView, me, applyFixture, logout, router]);

  useEffect(() => {
    if (!ready) return;
    if (!signedIn) {
      router.replace("/login");
      return;
    }
    if (canView) void load();
    else setLoading(false);
  }, [ready, signedIn, canView, load, router]);

  const listFilters: EventListFilters = useMemo(() => {
    const next: EventListFilters = {};
    if (collectiveFilter) next.collective = collectiveFilter;
    if (presaleFilter === copy.events.filters.yes) next.presale = "si";
    if (presaleFilter === copy.events.filters.no) next.presale = "no";
    if (commissionFilter) next.commission = commissionFilter;
    if (monthFilter) {
      const [y, m] = monthFilter.split("-");
      next.period_start = `${y}-${m}-01`;
      const lastDay = new Date(+y, +m, 0).getDate();
      next.period_end = `${y}-${m}-${lastDay.toString().padStart(2, "0")}`;
    }
    return next;
  }, [collectiveFilter, presaleFilter, commissionFilter, monthFilter]);

  const filteredEvents = useMemo(() => {
    const byField = applyEventFilters(catalog, listFilters);
    const needle = search.trim().toLowerCase();
    if (!needle) return byField;
    return byField.filter((event) =>
      [
        event.collective_name,
        event.collective_raw,
        event.event_name,
        event.commission,
        event.payment_method ?? "",
        event.exclusive_benefit ?? "",
        event.promotion_commitments ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [catalog, listFilters, search]);

  const summary = useMemo(() => {
    if (usingFixture || !summaryFromApi) {
      return summarizeEventSubmissions(filteredEvents, {
        scope: isSuperAdmin ? "admin" : "collective",
        isDemo: true,
        demoLabel: DEMO_EVENT_LABEL,
      });
    }
    return summaryFromApi;
  }, [usingFixture, summaryFromApi, filteredEvents, isSuperAdmin]);

  const uniqueCollectives = useMemo(() => {
    return Array.from(new Set(catalog.map((event) => event.collective_name))).sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }, [catalog]);

  const uniqueCommissions = useMemo(() => {
    return Array.from(new Set(catalog.map((event) => event.commission))).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b, "es");
    });
  }, [catalog]);

  const uniqueMonths = useMemo(() => {
    return Array.from(new Set(catalog.map((event) => bogotaYearMonth(event.event_at)))).sort();
  }, [catalog]);

  const byMonth = useMemo(
    () =>
      countBy(filteredEvents, (event) => bogotaYearMonth(event.event_at)).sort((a, b) =>
        a.key.localeCompare(b.key),
      ),
    [filteredEvents],
  );
  const byCollective = useMemo(
    () => countBy(filteredEvents, (event) => event.collective_name),
    [filteredEvents],
  );
  const byPayment = useMemo(
    () => countBy(filteredEvents, (event) => event.payment_method),
    [filteredEvents],
  );
  const byBenefit = useMemo(
    () => countBy(filteredEvents, (event) => event.exclusive_benefit),
    [filteredEvents],
  );
  const byCommitment = useMemo(() => {
    const acc = new Map<string, number>();
    for (const event of filteredEvents) {
      for (const commitment of splitCommitments(event.promotion_commitments)) {
        acc.set(commitment, (acc.get(commitment) ?? 0) + 1);
      }
    }
    return Array.from(acc.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "es"));
  }, [filteredEvents]);
  const byNightType = useMemo(() => {
    if (!usingFixture) return [];
    return countBy(filteredEvents, (event) => DEMO_NIGHT_LINES[event.event_name] ?? "Sin clasificar");
  }, [filteredEvents, usingFixture]);

  const handleClear = () => {
    setSearch("");
    setCollectiveFilter("");
    setPresaleFilter("");
    setCommissionFilter("");
    setMonthFilter("");
  };

  if (!ready || (loading && canView)) {
    return (
      <main id="contenido" className="page-wrap" tabIndex={-1}>
        <p className="page-kicker">{copy.loading}</p>
        <DashboardSkeleton />
      </main>
    );
  }

  if (!canView) {
    return (
      <main id="contenido" className="page-wrap" tabIndex={-1}>
        <h1 className="page-title">{copy.nav.tabs.events}</h1>
        <p className="page-lead">{copy.events.intro}</p>
        {isDemo ? (
          <Alert className="mt-6 mb-6" role="status">
            <Info size={16} weight="regular" aria-hidden />
            <AlertDescription>{copy.demo.banner}</AlertDescription>
          </Alert>
        ) : null}
        <Alert variant="destructive" className="mt-6">
          <WarningCircle size={16} weight="regular" aria-hidden />
          <AlertDescription>{copy.events.restricted}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const showDemoBanner = isDemo || usingFixture || summary.is_demo;

  return (
    <main id="contenido" className="page-wrap" tabIndex={-1}>
      <h1 className="page-title">{copy.events.title}</h1>
      <p className="page-lead">{copy.events.intro}</p>

      {showDemoBanner ? (
        <Alert className="mt-6 mb-6" role="status">
          <Info size={16} weight="regular" aria-hidden />
          <AlertDescription>{summary.demo_label ?? copy.events.exampleNote}</AlertDescription>
        </Alert>
      ) : (
        <div className="h-6" />
      )}

      {error ? (
        <Alert variant="destructive" className="mt-6 mb-6">
          <WarningCircle size={16} weight="regular" aria-hidden />
          <AlertDescription>
            <span className="block mb-3">{error}</span>
            <Button type="button" onClick={() => void load()}>
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-2 mb-6 grid grid-cols-1 gap-3 rounded-lg bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          type="search"
          placeholder={copy.events.filters.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:col-span-2"
        />
        {isSuperAdmin ? (
          <select
            value={collectiveFilter}
            onChange={(e) => setCollectiveFilter(e.target.value)}
            className="input-field h-11 text-sm"
            aria-label={copy.events.filters.allCollectives}
          >
            <option value="">{copy.events.filters.allCollectives}</option>
            {uniqueCollectives.map((collective) => (
              <option key={collective} value={collective}>
                {collective}
              </option>
            ))}
          </select>
        ) : null}
        <select
          value={presaleFilter}
          onChange={(e) => setPresaleFilter(e.target.value)}
          className="input-field h-11 text-sm"
          aria-label={copy.events.filters.allPresales}
        >
          <option value="">{copy.events.filters.allPresales}</option>
          <option>{copy.events.filters.yes}</option>
          <option>{copy.events.filters.no}</option>
        </select>
        <select
          value={commissionFilter}
          onChange={(e) => setCommissionFilter(e.target.value)}
          className="input-field h-11 text-sm"
          aria-label={copy.events.filters.allCommissions}
        >
          <option value="">{copy.events.filters.allCommissions}</option>
          {uniqueCommissions.map((commission) => (
            <option key={commission} value={commission}>
              {commission === "tarifa especial" ? commission : `${commission}%`}
            </option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="input-field h-11 text-sm"
          aria-label={copy.events.filters.allMonths}
        >
          <option value="">{copy.events.filters.allMonths}</option>
          {uniqueMonths.map((month) => (
            <option key={month} value={month}>
              {monthLabel(month)}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={handleClear} className="h-11">
          {copy.events.filters.clear}
        </Button>
      </div>

      <section className="kpi-stage mb-10" aria-label={copy.events.title}>
        <KpiStat label={copy.events.kpis.total} value={summary.kpis.event_count.toString()} />
        <KpiStat label={copy.events.kpis.collectives} value={summary.kpis.collective_count.toString()} />
        <KpiStat label={copy.events.kpis.withPresale} value={`${Math.round(summary.kpis.presale_pct)}%`} />
        <KpiStat label={copy.events.kpis.thisMonth} value={summary.kpis.events_this_month.toString()} />
        <KpiStat
          label={copy.events.kpis.topCollective}
          value={summary.kpis.top_collective?.name ?? "—"}
          hint={summary.kpis.top_collective ? `${summary.kpis.top_collective.event_count} eventos` : undefined}
        />
      </section>

      {summary.kpis.event_count > 0 ? (
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          <ChartBlock title={copy.events.charts.byDate} definition="Cantidad de eventos según el mes de la fecha informada.">
            <EventsBarChart label={copy.events.charts.byDate} data={toChart(byMonth, monthLabel)} />
          </ChartBlock>
          {usingFixture && byNightType.length > 0 ? (
            <ChartBlock title={copy.events.charts.nightType} definition={copy.events.charts.nightTypeNote}>
              <EventsBarChart label={copy.events.charts.nightType} horizontal data={toChart(byNightType)} />
            </ChartBlock>
          ) : null}
          {isSuperAdmin ? (
            <ChartBlock title={copy.events.charts.topCollectives} definition="Solo visible para el equipo Discover.">
              <EventsBarChart
                label={copy.events.charts.topCollectives}
                horizontal
                data={toChart(byCollective)}
              />
            </ChartBlock>
          ) : null}
          <ChartBlock title={copy.events.charts.presale} definition="Eventos con y sin preventa exclusiva Discover.">
            <EventsBarChart
              label={copy.events.charts.presale}
              horizontal
              data={toChart(summary.distributions.by_presale, (key) =>
                key === "si" ? "Sí" : key === "no" ? "No" : "Sin dato",
              )}
            />
          </ChartBlock>
          <ChartBlock title={copy.events.charts.commission} definition="Comisión informada, como string del contrato (por ejemplo 11.5).">
            <EventsBarChart
              label={copy.events.charts.commission}
              horizontal
              data={toChart(summary.distributions.by_commission, (key) =>
                key === "tarifa especial" ? key : `${key}%`,
              )}
            />
          </ChartBlock>
          <ChartBlock title={copy.events.charts.commitments} definition="Frecuencia de cada compromiso de promoción declarado.">
            <EventsBarChart label={copy.events.charts.commitments} horizontal data={toChart(byCommitment)} />
          </ChartBlock>
          <ChartBlock title={copy.events.charts.benefits} definition={copy.events.benefitNote}>
            <EventsBarChart label={copy.events.charts.benefits} horizontal data={toChart(byBenefit)} />
          </ChartBlock>
          <ChartBlock title={copy.events.charts.payment} definition="Medio de pago informado. No se muestra cuenta, banco ni documento.">
            <EventsBarChart label={copy.events.charts.payment} horizontal data={toChart(byPayment)} />
          </ChartBlock>
        </div>
      ) : null}

      <div className="surface-card">
        <div className="flex items-center justify-between border-b border-[var(--discover-slate)] px-4 py-3">
          <h2 className="text-sm font-semibold">{copy.events.table.title}</h2>
          <span className="text-xs text-muted-foreground">
            {filteredEvents.length} {filteredEvents.length === 1 ? "evento" : "eventos"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--secondary)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.date}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.collective}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.event}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.presale}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.commission}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.benefit}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.commitments}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.payment}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{copy.events.table.flyer}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--discover-slate)]">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    {copy.events.table.noResults}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={`${event.event_at}-${event.collective_name}-${event.event_name}`}
                    className="transition-colors hover:bg-[var(--bg-deep)]"
                  >
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(event.event_at)}</td>
                    <td className="px-4 py-3">
                      {event.collective_name}
                      {event.assignment_status === "unmapped" ? (
                        <div className="text-xs text-muted-foreground">{copy.events.unassigned}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{event.event_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          event.has_presale
                            ? "bg-[var(--chart-1)] text-[var(--primary-foreground)]"
                            : "bg-[var(--down)] text-[var(--primary-foreground)]"
                        }`}
                      >
                        {event.has_presale ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {event.commission === "tarifa especial" ? event.commission : `${event.commission}%`}
                    </td>
                    <td className="px-4 py-3">{event.exclusive_benefit || "—"}</td>
                    <td className="px-4 py-3">
                      {event.promotion_commitments ? (
                        <div className="flex flex-wrap gap-1">
                          {splitCommitments(event.promotion_commitments).map((commitment) => (
                            <span
                              key={commitment}
                              className="inline-block rounded bg-[var(--secondary)] px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {commitment}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{event.payment_method || "—"}</td>
                    <td className="px-4 py-3">
                      {event.flyer_url ? (
                        <a
                          href={event.flyer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--chart-1)] hover:underline"
                        >
                          Ver flyer
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
