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

const EventsBarChart = dynamic(
  () => import("@/brand/charts/EventsBarChart").then((m) => m.EventsBarChart),
  { ssr: false },
);
const EventsPieChart = dynamic(
  () => import("@/brand/charts/EventsPieChart").then((m) => m.EventsPieChart),
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

export default function EventosPage() {
  const { token, me, isDemo, ready, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [collectiveFilter, setCollectiveFilter] = useState("");
  const [presaleFilter, setPresaleFilter] = useState("");
  const [commissionFilter, setCommissionFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [events, setEvents] = useState<EventSubmission[]>([]);
  const [summary, setSummary] = useState<EventSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canView = me?.role === "super_admin" || me?.role === "collective";
  const isSuperAdmin = me?.role === "super_admin";

  useEffect(() => {
    if (ready && !canView) {
      router.replace("/");
    }
  }, [ready, canView, router]);

  const load = useCallback(async () => {
    if (!canView) return;
    if (!token && !isDemo) return;

    setLoading(true);
    setError(null);

    try {
      const query: EventSubmissionsQuery = {
        is_demo: isDemo,
      };

      if (collectiveFilter) query.collective = collectiveFilter;
      if (presaleFilter) {
        query.presale = presaleFilter === "Sí" ? "si" : "no";
      }
      if (commissionFilter) query.commission = commissionFilter;
      if (monthFilter) {
        const [y, m] = monthFilter.split("-");
        query.period_start = `${y}-${m}-01`;
        const lastDay = new Date(+y, +m, 0).getDate();
        query.period_end = `${y}-${m}-${lastDay.toString().padStart(2, "0")}`;
      }

      const [eventsRes, summaryRes] = await Promise.all([
        token
          ? fetchEventSubmissions(token, query)
          : Promise.resolve({
              name: "event_submissions",
              title: "Respuestas de detalles de evento",
              data_source: "fixture",
              is_demo: true,
              demo_label: "Datos de ejemplo",
              as_of: new Date().toISOString().split("T")[0],
              scope: "admin",
              unmapped_visible: true,
              count: 0,
              items: [],
            }),
        token
          ? fetchEventSubmissionsSummary(token, query)
          : Promise.resolve({
              name: "event_submissions_summary",
              scope: "admin",
              data_source: "fixture",
              is_demo: true,
              demo_label: "Datos de ejemplo",
              as_of: new Date().toISOString().split("T")[0],
              kpis: {
                event_count: 0,
                collective_count: 0,
                presale_pct: 0,
                events_this_month: 0,
                top_collective: null,
              },
              unmapped_count: 0,
              distributions: {
                by_commission: [],
                by_presale: [],
              },
            }),
      ]);

      setEvents(eventsRes.items);
      setSummary(summaryRes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setError(copy.events.restricted);
      } else {
        setError(err instanceof ApiError ? err.message : copy.errors.metrics);
      }
    } finally {
      setLoading(false);
    }
  }, [token, isDemo, canView, collectiveFilter, presaleFilter, commissionFilter, monthFilter, logout, router]);

  useEffect(() => {
    if (ready && canView) void load();
  }, [ready, canView, load]);

  const uniqueCollectives = useMemo(() => {
    const set = new Set(events.map((e) => e.collective_name));
    return Array.from(set).sort();
  }, [events]);

  const uniqueCommissions = useMemo(() => {
    const set = new Set(events.map((e) => e.commission));
    return Array.from(set).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b, "es");
    });
  }, [events]);

  const uniqueMonths = useMemo(() => {
    const set = new Set(
      events.map((e) => {
        const date = new Date(e.event_at);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      }),
    );
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        !search ||
        [
          e.collective_name,
          e.collective_raw,
          e.event_name,
          e.commission,
          e.payment_method ?? "",
          e.exclusive_benefit ?? "",
          e.promotion_commitments ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [events, search]);

  const handleClear = () => {
    setSearch("");
    setCollectiveFilter("");
    setPresaleFilter("");
    setCommissionFilter("");
    setMonthFilter("");
  };

  if (!ready || loading) {
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
        <Alert variant="destructive" className="mt-6">
          <WarningCircle size={16} weight="regular" aria-hidden />
          <AlertDescription>{copy.events.restricted}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main id="contenido" className="page-wrap" tabIndex={-1}>
      <h1 className="page-title">{copy.events.title}</h1>
      <p className="page-lead">{copy.events.intro}</p>

      {(isDemo || summary?.is_demo) && (
        <Alert className="mt-6 mb-6" role="status">
          <Info size={16} weight="regular" aria-hidden />
          <AlertDescription>
            {summary?.demo_label ?? copy.events.exampleNote}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6 mb-6">
          <WarningCircle size={16} weight="regular" aria-hidden />
          <AlertDescription>
            <span className="block mb-3">{error}</span>
            <Button type="button" onClick={() => void load()}>
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="mt-8 mb-6 grid grid-cols-1 gap-3 rounded-lg bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          type="search"
          placeholder={copy.events.filters.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:col-span-2"
        />
        {isSuperAdmin && (
          <select
            value={collectiveFilter}
            onChange={(e) => {
              setCollectiveFilter(e.target.value);
              void load();
            }}
            className="input-field h-11 text-sm"
          >
            <option value="">{copy.events.filters.allCollectives}</option>
            {uniqueCollectives.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <select
          value={presaleFilter}
          onChange={(e) => {
            setPresaleFilter(e.target.value);
            void load();
          }}
          className="input-field h-11 text-sm"
        >
          <option value="">{copy.events.filters.allPresales}</option>
          <option>{copy.events.filters.yes}</option>
          <option>{copy.events.filters.no}</option>
        </select>
        <select
          value={commissionFilter}
          onChange={(e) => {
            setCommissionFilter(e.target.value);
            void load();
          }}
          className="input-field h-11 text-sm"
        >
          <option value="">{copy.events.filters.allCommissions}</option>
          {uniqueCommissions.map((c) => (
            <option key={c} value={c}>
              {c}%
            </option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => {
            setMonthFilter(e.target.value);
            void load();
          }}
          className="input-field h-11 text-sm"
        >
          <option value="">{copy.events.filters.allMonths}</option>
          {uniqueMonths.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={handleClear} className="h-11">
          {copy.events.filters.clear}
        </Button>
      </div>

      {/* KPIs */}
      {summary && (
        <section className="kpi-stage mb-10" aria-label={copy.events.title}>
          <KpiStat label={copy.events.kpis.total} value={summary.kpis.event_count.toString()} />
          <KpiStat
            label={copy.events.kpis.collectives}
            value={summary.kpis.collective_count.toString()}
          />
          <KpiStat
            label={copy.events.kpis.withPresale}
            value={`${Math.round(summary.kpis.presale_pct)}%`}
          />
          <KpiStat
            label={copy.events.kpis.thisMonth}
            value={summary.kpis.events_this_month.toString()}
          />
          <KpiStat
            label={copy.events.kpis.topCollective}
            value={summary.kpis.top_collective?.name ?? "—"}
            hint={
              summary.kpis.top_collective
                ? `${summary.kpis.top_collective.event_count} eventos`
                : undefined
            }
          />
        </section>
      )}

      {/* Gráficos */}
      {summary && summary.kpis.event_count > 0 && (
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          {summary.distributions.by_presale.length > 0 && (
            <ChartBlock title={copy.events.charts.presale} definition="">
              <EventsPieChart
                label={copy.events.charts.presale}
                data={summary.distributions.by_presale.map((d) => ({
                  label: d.key === "si" ? "Sí" : d.key === "no" ? "No" : "Sin dato",
                  value: d.count,
                }))}
              />
            </ChartBlock>
          )}
          {summary.distributions.by_commission.length > 0 && (
            <ChartBlock title={copy.events.charts.commission} definition="">
              <EventsPieChart
                label={copy.events.charts.commission}
                data={summary.distributions.by_commission.map((d) => ({
                  label: `${d.key}%`,
                  value: d.count,
                }))}
              />
            </ChartBlock>
          )}
        </div>
      )}

      {/* Tabla */}
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.date}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.collective}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.event}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.presale}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.commission}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.benefit}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.commitments}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.payment}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.events.table.flyer}
                </th>
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
                filteredEvents.map((event, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-[var(--bg-deep)]">
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(event.event_at)}</td>
                    <td className="px-4 py-3">
                      {event.collective_name}
                      {event.collective_raw !== event.collective_name && (
                        <div className="text-xs text-muted-foreground">
                          orig.: {event.collective_raw}
                        </div>
                      )}
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
                    <td className="whitespace-nowrap px-4 py-3">{event.commission}%</td>
                    <td className="px-4 py-3">{event.exclusive_benefit || "—"}</td>
                    <td className="px-4 py-3">
                      {event.promotion_commitments ? (
                        <div className="flex flex-wrap gap-1">
                          {event.promotion_commitments.split(/[,;]+/).map((c, i) => (
                            <span
                              key={i}
                              className="inline-block rounded bg-[var(--secondary)] px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {c.trim()}
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
                          className="text-[var(--chart-3)] hover:underline"
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
