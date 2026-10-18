import type { AttendancePoint, SalesPoint } from "./types";

export function sumRedeemed(points: AttendancePoint[]): number {
  return points.reduce((acc, p) => acc + p.redeemed_tickets, 0);
}

export function sumOrders(points: SalesPoint[]): number {
  return points.reduce((acc, p) => acc + p.order_count, 0);
}

export function sumRevenueCents(points: SalesPoint[]): number {
  return points.reduce((acc, p) => acc + p.revenue_cents, 0);
}

/**
 * Explicit Colombian pesos for KPIs.
 *
 * Backend field is `revenue_cents`. Until the API contract confirms the unit,
 * values are shown as whole COP (no ÷ 100). Demo fixtures sum to 45.830.000.
 */
export function formatMoney(amount: number): string {
  const grouped = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${grouped} COP`;
}

export function formatCount(n: number): string {
  return n.toLocaleString("es-CO");
}

type NightRow = { night_date: string; [venueKey: string]: string | number };

/** Pivot attendance points → one row per night, columns per venue (short id). */
export function pivotAttendanceByNight(
  points: AttendancePoint[],
  venueNames?: Record<string, string>,
): {
  rows: NightRow[];
  venueKeys: string[];
  venueLabels: Record<string, string>;
  venueIdByKey: Record<string, string>;
} {
  const venueIds = [...new Set(points.map((p) => p.venue_id))].sort();
  const venueLabels: Record<string, string> = {};
  const venueIdByKey: Record<string, string> = {};
  const venueKeys = venueIds.map((id, i) => {
    const key = `v${i + 1}`;
    venueLabels[key] = venueNames?.[id] ?? `Establecimiento ${i + 1}`;
    venueIdByKey[key] = id;
    return key;
  });
  const idToKey = Object.fromEntries(venueIds.map((id, i) => [id, venueKeys[i]]));

  const byNight = new Map<string, NightRow>();
  for (const p of points) {
    const row = byNight.get(p.night_date) ?? { night_date: p.night_date };
    const key = idToKey[p.venue_id];
    row[key] = ((row[key] as number | undefined) ?? 0) + p.redeemed_tickets;
    byNight.set(p.night_date, row);
  }

  const rows = [...byNight.values()].sort((a, b) =>
    a.night_date.localeCompare(b.night_date),
  );
  return { rows, venueKeys, venueLabels, venueIdByKey };
}

export function pivotSalesByNight(
  points: SalesPoint[],
  venueNames?: Record<string, string>,
): {
  rows: NightRow[];
  venueKeys: string[];
  venueLabels: Record<string, string>;
  venueIdByKey: Record<string, string>;
} {
  const venueIds = [...new Set(points.map((p) => p.venue_id))].sort();
  const venueLabels: Record<string, string> = {};
  const venueIdByKey: Record<string, string> = {};
  const venueKeys = venueIds.map((id, i) => {
    const key = `v${i + 1}`;
    venueLabels[key] = venueNames?.[id] ?? `Establecimiento ${i + 1}`;
    venueIdByKey[key] = id;
    return key;
  });
  const idToKey = Object.fromEntries(venueIds.map((id, i) => [id, venueKeys[i]]));

  const byNight = new Map<string, NightRow>();
  for (const p of points) {
    const row = byNight.get(p.night_date) ?? { night_date: p.night_date };
    const key = idToKey[p.venue_id];
    row[key] = ((row[key] as number | undefined) ?? 0) + p.order_count;
    byNight.set(p.night_date, row);
  }

  const rows = [...byNight.values()].sort((a, b) =>
    a.night_date.localeCompare(b.night_date),
  );
  return { rows, venueKeys, venueLabels, venueIdByKey };
}

export function shortNightLabel(iso: string): string {
  const d = iso.slice(5); // MM-DD
  return d;
}
