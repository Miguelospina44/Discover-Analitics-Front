import {
  ApiError,
  type AccountOut,
  type AttendanceMeasure,
  type GenderMeasure,
  type GremialBenchmarks,
  type MeResponse,
  type Period,
  type SalesMeasure,
  type TokenResponse,
  type VenueOut,
} from "./types";

export function apiUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002").replace(/\/$/, "");
  return `${base}${path}`;
}

async function parseError(res: Response): Promise<never> {
  let detail = `Error ${res.status}`;
  try {
    const body = (await res.json()) as { detail?: string | { msg?: string }[] };
    if (typeof body.detail === "string") detail = body.detail;
    else if (Array.isArray(body.detail) && body.detail[0]?.msg) detail = body.detail[0].msg;
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, detail);
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(apiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TokenResponse>;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export type MetricQuery = {
  period: Period;
  accountId?: string | null;
  venueId?: string | null;
  gender?: string | null;
};

function metricQs(q: MetricQuery, opts?: { includeGender?: boolean }): URLSearchParams {
  const qs = new URLSearchParams({
    period_start: q.period.start,
    period_end: q.period.end,
  });
  if (q.accountId) qs.set("account_id", q.accountId);
  if (q.venueId) qs.set("venue_id", q.venueId);
  if (opts?.includeGender !== false && q.gender) qs.set("gender", q.gender);
  return qs;
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetch(apiUrl("/api/v1/auth/me"), { headers: authHeaders(token) });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<MeResponse>;
}

export async function fetchAccounts(token: string): Promise<AccountOut[]> {
  const res = await fetch(apiUrl("/api/v1/accounts"), { headers: authHeaders(token) });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AccountOut[]>;
}

export async function fetchVenues(
  token: string,
  accountId?: string | null,
): Promise<VenueOut[]> {
  const qs = new URLSearchParams();
  if (accountId) qs.set("account_id", accountId);
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetch(apiUrl(`/api/v1/venues${suffix}`), { headers: authHeaders(token) });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<VenueOut[]>;
}

export async function fetchNightlyAttendance(
  token: string,
  query: MetricQuery,
): Promise<AttendanceMeasure> {
  const qs = metricQs(query);
  const res = await fetch(apiUrl(`/api/v1/metrics/nightly-attendance?${qs}`), {
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AttendanceMeasure>;
}

export async function fetchSalesByNight(
  token: string,
  query: MetricQuery,
): Promise<SalesMeasure> {
  const qs = metricQs(query, { includeGender: false });
  const res = await fetch(apiUrl(`/api/v1/metrics/sales-by-night?${qs}`), {
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<SalesMeasure>;
}

export async function fetchAttendanceByGender(
  token: string,
  query: MetricQuery,
): Promise<GenderMeasure> {
  const qs = metricQs(query);
  const res = await fetch(apiUrl(`/api/v1/metrics/attendance-by-gender?${qs}`), {
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<GenderMeasure>;
}

export async function fetchGremialBenchmarks(
  token: string,
  period: Period,
): Promise<GremialBenchmarks> {
  const qs = new URLSearchParams({
    period_start: period.start,
    period_end: period.end,
  });
  const res = await fetch(apiUrl(`/api/v1/metrics/gremial-benchmarks?${qs}`), {
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<GremialBenchmarks>;
}
