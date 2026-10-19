import type { AttendancePoint, AudienceGenderAgePoint, SalesPoint } from "./types";

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
 * PENDING BACKEND CONTRACT — single conversion point for `revenue_cents`.
 *
 * The API names the field `revenue_cents`. Until the contract confirms whether
 * values are whole Colombian pesos or centavos, this is identity (no ÷ 100).
 * KPIs, charts, axis ticks, and tooltips MUST go through `revenueFromField`.
 * If the API later documents centavos, change `REVENUE_CENTS_TO_COP` to `0.01`.
 */
export const REVENUE_CENTS_TO_COP = 1;

export function revenueFromField(revenueCents: number): number {
  return revenueCents * REVENUE_CENTS_TO_COP;
}

export function formatMoney(amount: number): string {
  const grouped = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${grouped} COP`;
}

export function formatRevenueFromField(revenueCents: number): string {
  return formatMoney(revenueFromField(revenueCents));
}

export function formatCount(n: number): string {
  return n.toLocaleString("es-CO");
}

export function formatSharePercent(share: number): string {
  return `${(share * 100).toLocaleString("es-CO", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} %`;
}

export function formatAverage(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-CO", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
}

export function formatAxisCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mill.`;
  }
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

function dateParts(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

export function formatPeriodRange(startIso: string, endIso: string): string {
  const start = dateParts(startIso);
  const end = dateParts(endIso);
  if (!start || !end) return `${startIso} – ${endIso}`;
  const startMonth = MONTHS_ES[start.m - 1];
  const endMonth = MONTHS_ES[end.m - 1];
  if (!startMonth || !endMonth) return `${startIso} – ${endIso}`;
  if (start.y === end.y && start.m === end.m) {
    return `${start.d}–${end.d} ${startMonth} ${start.y}`;
  }
  if (start.y === end.y) {
    return `${start.d} ${startMonth} – ${end.d} ${endMonth} ${start.y}`;
  }
  return `${start.d} ${startMonth} ${start.y} – ${end.d} ${endMonth} ${end.y}`;
}

export function formatNightTick(iso: string): string {
  const parts = dateParts(iso);
  if (!parts) return iso.slice(5);
  const month = MONTHS_ES[parts.m - 1];
  return month ? `${parts.d} ${month}` : iso.slice(5);
}

export function sectorDeltaPercent(own: number | null, sector: number | null): number | null {
  if (own == null || sector == null || sector === 0) return null;
  return ((own - sector) / sector) * 100;
}

type NightRow = { night_date: string; [venueKey: string]: string | number };

function pivotByNight(
  points: { venue_id: string; night_date: string; value: number }[],
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
    row[key] = ((row[key] as number | undefined) ?? 0) + p.value;
    byNight.set(p.night_date, row);
  }

  const rows = [...byNight.values()].sort((a, b) => a.night_date.localeCompare(b.night_date));
  return { rows, venueKeys, venueLabels, venueIdByKey };
}

/** Pivot attendance points → one row per night, columns per venue (short id). */
export function pivotAttendanceByNight(
  points: AttendancePoint[],
  venueNames?: Record<string, string>,
) {
  return pivotByNight(
    points.map((p) => ({
      venue_id: p.venue_id,
      night_date: p.night_date,
      value: p.redeemed_tickets,
    })),
    venueNames,
  );
}

/** Pivot sales nights using converted `revenue_cents` (not order_count). */
export function pivotSalesByNight(
  points: SalesPoint[],
  venueNames?: Record<string, string>,
) {
  return pivotByNight(
    points.map((p) => ({
      venue_id: p.venue_id,
      night_date: p.night_date,
      value: revenueFromField(p.revenue_cents),
    })),
    venueNames,
  );
}

export function shortNightLabel(iso: string): string {
  return formatNightTick(iso);
}

export const AGE_BAND_ORDER = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
  "sin_dato",
  "otros",
] as const;

export const GENDER_SERIES_ORDER = ["woman", "man", "other", "sin_dato", "otros"] as const;

export type AudienceAgeRow = {
  age_band: string;
} & Record<string, string | number>;

export function pivotAudienceGenderAge(points: AudienceGenderAgePoint[]): {
  rows: AudienceAgeRow[];
  genders: string[];
} {
  const presentGenders = new Set(points.map((p) => p.gender));
  const genders: string[] = GENDER_SERIES_ORDER.filter((g) => presentGenders.has(g));
  for (const p of points) {
    if (!genders.includes(p.gender)) genders.push(p.gender);
  }

  const presentBands = new Set(points.map((p) => p.age_band));
  const bands: string[] = AGE_BAND_ORDER.filter((b) => presentBands.has(b));
  for (const p of points) {
    if (!bands.includes(p.age_band)) bands.push(p.age_band);
  }

  const byBand = new Map<string, AudienceAgeRow>();
  for (const band of bands) {
    const row: AudienceAgeRow = { age_band: band };
    for (const gender of genders) {
      row[gender] = 0;
      row[`${gender}_share`] = 0;
    }
    byBand.set(band, row);
  }
  for (const p of points) {
    const row = byBand.get(p.age_band);
    if (!row) continue;
    row[p.gender] = p.headcount;
    row[`${p.gender}_share`] = p.share;
  }
  const rows: AudienceAgeRow[] = [];
  for (const band of bands) {
    const row = byBand.get(band);
    if (row) rows.push(row);
  }
  return { rows, genders };
}
