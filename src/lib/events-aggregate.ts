import type { EventSubmission, EventSummaryResponse } from "./events-types";

export type EventListFilters = {
  collective?: string;
  presale?: "si" | "no";
  commission?: string;
  period_start?: string;
  period_end?: string;
};

export function bogotaYearMonth(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(iso));
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

export function currentBogotaYearMonth(): string {
  return bogotaYearMonth(new Date().toISOString());
}

export function countBy(items: EventSubmission[], keyFn: (item: EventSubmission) => string | null): { key: string; count: number }[] {
  const acc = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    acc.set(key, (acc.get(key) ?? 0) + 1);
  }
  return Array.from(acc.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "es"));
}

export function eventsVisibleToRole(
  items: EventSubmission[],
  role: string,
  accountId: string | null,
): EventSubmission[] {
  if (role === "account_owner") return [];
  if (role === "collective") {
    return items.filter((item) => item.account_id && item.account_id === accountId && item.assignment_status === "mapped");
  }
  return items;
}

export function applyEventFilters(items: EventSubmission[], filters: EventListFilters): EventSubmission[] {
  return items.filter((item) => {
    if (filters.collective && item.collective_name !== filters.collective) return false;
    if (filters.presale === "si" && !item.has_presale) return false;
    if (filters.presale === "no" && item.has_presale) return false;
    if (filters.commission && item.commission !== filters.commission) return false;
    const day = item.event_at.slice(0, 10);
    if (filters.period_start && day < filters.period_start) return false;
    if (filters.period_end && day > filters.period_end) return false;
    return true;
  });
}

export function summarizeEventSubmissions(
  items: EventSubmission[],
  opts: { scope: string; isDemo: boolean; demoLabel: string | null },
): EventSummaryResponse {
  const collectives = new Set(items.map((item) => item.collective_name));
  const presaleCount = items.filter((item) => item.has_presale).length;
  const thisMonth = currentBogotaYearMonth();
  const eventsThisMonth = items.filter((item) => bogotaYearMonth(item.event_at) === thisMonth).length;
  const byCollective = countBy(items, (item) => item.collective_name);
  const top = byCollective[0];

  return {
    name: "event_submissions_summary",
    scope: opts.scope,
    data_source: opts.isDemo ? "fixture" : "api",
    is_demo: opts.isDemo,
    demo_label: opts.demoLabel,
    as_of: "2026-11-04",
    kpis: {
      event_count: items.length,
      collective_count: collectives.size,
      presale_pct: items.length ? Math.round((presaleCount / items.length) * 1000) / 10 : 0,
      events_this_month: eventsThisMonth,
      top_collective: top ? { name: top.key, event_count: top.count } : null,
    },
    unmapped_count: items.filter((item) => item.assignment_status === "unmapped").length,
    distributions: {
      by_commission: countBy(items, (item) => item.commission),
      by_presale: countBy(items, (item) => (item.has_presale ? "si" : "no")),
    },
  };
}

export function splitCommitments(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
