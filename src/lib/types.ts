export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type MeResponse = {
  email: string;
  role: string;
  account_id: string;
  account_name: string | null;
};

export type AccountOut = {
  id: string;
  name: string;
  slug: string;
};

export type VenueOut = {
  venue_id: string;
  account_id: string;
  name: string;
  city: string;
};

export type AttendancePoint = {
  venue_id: string;
  night_date: string;
  redeemed_tickets: number;
  account_id?: string | null;
};

export type SalesPoint = {
  venue_id: string;
  night_date: string;
  order_count: number;
  revenue_cents: number;
  account_id?: string | null;
};

export type MeasureEnvelope<T> = {
  name: string;
  title: string;
  unit: string;
  definition: string;
  as_of: string | null;
  data_quality: string;
  data_source: string;
  scope: string;
  points: T[];
};

export type AttendanceMeasure = MeasureEnvelope<AttendancePoint>;
export type SalesMeasure = MeasureEnvelope<SalesPoint>;

export type GenderCode = "woman" | "man" | "other" | "undisclosed" | "sin_dato" | "otros";

export type AgeBand = "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "sin_dato" | "otros";

export type AudienceGenderAgePoint = {
  gender: GenderCode | string;
  age_band: AgeBand | string;
  headcount: number;
  share: number;
};

/** Envelope for GET /api/v1/metrics/audience-by-gender-age (Back PR #11). */
export type AudienceGenderAgeMeasure = {
  name: string;
  title: string;
  unit: string;
  definition: string;
  as_of: string | null;
  data_quality: string;
  data_source: string;
  is_demo: boolean;
  demo_label: string | null;
  scope: string;
  k_anonymity: number;
  suppressed: boolean;
  points: AudienceGenderAgePoint[];
};

export type GenderPoint = {
  gender: GenderCode | string;
  headcount: number;
  share: number;
  account_id?: string | null;
};

export type GenderMeasure = MeasureEnvelope<GenderPoint>;

export type GremialBenchmarks = {
  period_start: string;
  period_end: string;
  avg_tickets_per_venue_night: number | null;
  median_tickets_per_venue_night: number | null;
  avg_orders_per_venue_night: number | null;
  median_orders_per_venue_night: number | null;
  accounts_in_sample: number;
  nights_in_sample: number;
  share_woman?: number | null;
  share_man?: number | null;
  share_other?: number | null;
  share_undisclosed?: number | null;
  note: string;
};

export type Period = {
  start: string;
  end: string;
};

/** Seed facts cover these nights — default hub window. */
export const DEFAULT_PERIOD: Period = {
  start: "2026-08-01",
  end: "2026-08-14",
};

export const DEMO_LOGINS = [
  {
    label: "Administración",
    email: "superadmin@discover.example.com",
    password: "change-me-now",
  },
  {
    label: "Club de Miguel",
    email: "miguel@miguelsclub.example.com",
    password: "change-me-now",
  },
] as const;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
