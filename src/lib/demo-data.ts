import type {
  AccountOut,
  AttendanceMeasure,
  AudienceGenderAgeMeasure,
  GenderMeasure,
  GremialBenchmarks,
  MeResponse,
  SalesMeasure,
  VenueOut,
} from "./types";

/** Clearly fake fixtures for the MVP look-and-feel preview. Not operational data. */
export const DEMO_ME: MeResponse = {
  email: "ejemplo@discover.test",
  role: "account_owner",
  account_id: "demo-account",
  account_name: "Sala Norte (ejemplo)",
};

export const DEMO_ACCOUNTS: AccountOut[] = [
  { id: "demo-account", name: "Sala Norte (ejemplo)", slug: "sala-norte-ejemplo" },
  { id: "demo-account-2", name: "Sala Sur (ejemplo)", slug: "sala-sur-ejemplo" },
];

export const DEMO_VENUES: VenueOut[] = [
  {
    venue_id: "venue-norte",
    account_id: "demo-account",
    name: "Sala Norte (ejemplo)",
    city: "Bogotá",
  },
  {
    venue_id: "venue-sur",
    account_id: "demo-account",
    name: "Sala Sur (ejemplo)",
    city: "Bogotá",
  },
];

const nights = [
  "2026-08-01",
  "2026-08-02",
  "2026-08-07",
  "2026-08-08",
  "2026-08-09",
  "2026-08-14",
] as const;

export const DEMO_ATTENDANCE: AttendanceMeasure = {
  name: "nightly-attendance",
  title: "Asistencia por noche",
  unit: "personas",
  definition: "Datos de ejemplo.",
  as_of: "2026-08-14",
  data_quality: "complete",
  data_source: "ejemplo",
  scope: "account",
  points: [
    { venue_id: "venue-norte", night_date: nights[0], redeemed_tickets: 186 },
    { venue_id: "venue-sur", night_date: nights[0], redeemed_tickets: 142 },
    { venue_id: "venue-norte", night_date: nights[1], redeemed_tickets: 94 },
    { venue_id: "venue-sur", night_date: nights[1], redeemed_tickets: 118 },
    { venue_id: "venue-norte", night_date: nights[2], redeemed_tickets: 241 },
    { venue_id: "venue-sur", night_date: nights[2], redeemed_tickets: 173 },
    { venue_id: "venue-norte", night_date: nights[3], redeemed_tickets: 268 },
    { venue_id: "venue-sur", night_date: nights[3], redeemed_tickets: 201 },
    { venue_id: "venue-norte", night_date: nights[4], redeemed_tickets: 157 },
    { venue_id: "venue-sur", night_date: nights[4], redeemed_tickets: 129 },
    { venue_id: "venue-norte", night_date: nights[5], redeemed_tickets: 219 },
    { venue_id: "venue-sur", night_date: nights[5], redeemed_tickets: 164 },
  ],
};

export const DEMO_SALES: SalesMeasure = {
  name: "sales-by-night",
  title: "Ingresos por noche",
  unit: "COP",
  definition: "Datos de ejemplo.",
  as_of: "2026-08-14",
  data_quality: "complete",
  data_source: "ejemplo",
  scope: "account",
  points: [
    { venue_id: "venue-norte", night_date: nights[0], order_count: 74, revenue_cents: 4_280_000 },
    { venue_id: "venue-sur", night_date: nights[0], order_count: 61, revenue_cents: 3_140_000 },
    { venue_id: "venue-norte", night_date: nights[1], order_count: 38, revenue_cents: 1_920_000 },
    { venue_id: "venue-sur", night_date: nights[1], order_count: 44, revenue_cents: 2_260_000 },
    { venue_id: "venue-norte", night_date: nights[2], order_count: 91, revenue_cents: 5_670_000 },
    { venue_id: "venue-sur", night_date: nights[2], order_count: 68, revenue_cents: 3_810_000 },
    { venue_id: "venue-norte", night_date: nights[3], order_count: 104, revenue_cents: 6_430_000 },
    { venue_id: "venue-sur", night_date: nights[3], order_count: 79, revenue_cents: 4_520_000 },
    { venue_id: "venue-norte", night_date: nights[4], order_count: 52, revenue_cents: 2_840_000 },
    { venue_id: "venue-sur", night_date: nights[4], order_count: 47, revenue_cents: 2_410_000 },
    { venue_id: "venue-norte", night_date: nights[5], order_count: 83, revenue_cents: 4_960_000 },
    { venue_id: "venue-sur", night_date: nights[5], order_count: 66, revenue_cents: 3_590_000 },
  ],
};

export const DEMO_GENDER: GenderMeasure = {
  name: "attendance-by-gender",
  title: "Audiencia",
  unit: "personas",
  definition: "Datos de ejemplo.",
  as_of: "2026-08-14",
  data_quality: "complete",
  data_source: "ejemplo",
  scope: "account",
  points: [
    { gender: "woman", headcount: 982, share: 0.47 },
    { gender: "man", headcount: 857, share: 0.41 },
    { gender: "other", headcount: 84, share: 0.04 },
    { gender: "undisclosed", headcount: 167, share: 0.08 },
  ],
};

export const DEMO_BENCH: GremialBenchmarks = {
  period_start: "2026-08-01",
  period_end: "2026-08-14",
  avg_tickets_per_venue_night: 148.3,
  median_tickets_per_venue_night: 139,
  avg_orders_per_venue_night: 52.6,
  median_orders_per_venue_night: 49,
  accounts_in_sample: 18,
  nights_in_sample: 96,
  share_woman: 0.44,
  share_man: 0.46,
  share_other: 0.03,
  share_undisclosed: 0.07,
  note: "Promedio anónimo de ejemplo. No es una muestra real del sector.",
};

/** Seed cells from Back PR #11. Labeled as example — not Discover rows. */
export const DEMO_AUDIENCE_GENDER_AGE: AudienceGenderAgeMeasure = {
  name: "audience_by_gender_age",
  title: "Audiencia por género y rango de edad",
  unit: "headcount",
  definition:
    "Compradores distintos por género declarado y rango de edad (18-24 … 55+). Celdas con menos de 10 personas se agrupan en otros o se omiten. Género o edad nulos van a sin_dato. No expone user_id ni filas individuales.",
  as_of: "2026-10-19",
  data_quality: "ok",
  data_source: "seed",
  is_demo: true,
  demo_label: "Datos de ejemplo. No corresponden a una operación real y no son filas de Discover.",
  scope: "account",
  k_anonymity: 10,
  suppressed: false,
  points: [
    { gender: "woman", age_band: "18-24", headcount: 28, share: 0.1186 },
    { gender: "woman", age_band: "25-34", headcount: 41, share: 0.1737 },
    { gender: "woman", age_band: "35-44", headcount: 22, share: 0.0932 },
    { gender: "woman", age_band: "45-54", headcount: 14, share: 0.0593 },
    { gender: "man", age_band: "18-24", headcount: 19, share: 0.0805 },
    { gender: "man", age_band: "25-34", headcount: 36, share: 0.1525 },
    { gender: "man", age_band: "35-44", headcount: 24, share: 0.1017 },
    { gender: "man", age_band: "45-54", headcount: 12, share: 0.0508 },
    { gender: "man", age_band: "55+", headcount: 11, share: 0.0466 },
    { gender: "other", age_band: "25-34", headcount: 11, share: 0.0466 },
    { gender: "sin_dato", age_band: "sin_dato", headcount: 18, share: 0.0763 },
  ],
};

/** Contract: total headcount < 10 → empty points (k-anonymity). */
export const DEMO_AUDIENCE_GENDER_AGE_PRIVACY: AudienceGenderAgeMeasure = {
  ...DEMO_AUDIENCE_GENDER_AGE,
  suppressed: true,
  points: [],
};

export const DEMO_EMPTY_ATTENDANCE: AttendanceMeasure = {
  ...DEMO_ATTENDANCE,
  data_quality: "missing",
  points: [],
};

export const DEMO_EMPTY_SALES: SalesMeasure = {
  ...DEMO_SALES,
  data_quality: "missing",
  points: [],
};
