import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, fetchEvent, fetchEvents, login, submitLead } from "./api";
import { ApiError } from "./types";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ORIGINAL_API_URL = process.env.NEXT_PUBLIC_API_URL;

function setApiUrl(value: string | undefined) {
  if (value === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = value;
}

afterEach(() => {
  setApiUrl(ORIGINAL_API_URL);
  vi.unstubAllGlobals();
});

describe("apiUrl", () => {
  it("returns a relative same-origin path when NEXT_PUBLIC_API_URL is unset", () => {
    setApiUrl(undefined);
    expect(apiUrl("/api/v1/auth/me")).toBe("/api/v1/auth/me");
  });

  it("returns a relative same-origin path when NEXT_PUBLIC_API_URL is empty", () => {
    setApiUrl("");
    expect(apiUrl("/api/v1/auth/me")).toBe("/api/v1/auth/me");
  });

  it("returns an empty string for the default path when unset", () => {
    setApiUrl(undefined);
    expect(apiUrl()).toBe("");
  });

  it("prefixes an absolute base when NEXT_PUBLIC_API_URL is set", () => {
    setApiUrl("http://api.example.com");
    expect(apiUrl("/api/v1/accounts")).toBe("http://api.example.com/api/v1/accounts");
  });

  it("trims a trailing slash from the base", () => {
    setApiUrl("http://api.example.com/");
    expect(apiUrl("/api/v1/accounts")).toBe("http://api.example.com/api/v1/accounts");
  });
});

describe("login", () => {
  it("resolves the token payload on a successful response", async () => {
    const payload = { access_token: "tok", token_type: "bearer" };
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("a@b.com", "secret")).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/auth/login");
    expect(init?.method).toBe("POST");
  });

  it("throws an ApiError carrying the backend detail on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ detail: "Credenciales inválidas" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(login("a@b.com", "bad")).rejects.toMatchObject({
      status: 401,
      message: "Credenciales inválidas",
    });
    await expect(login("a@b.com", "bad")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("fetchEvents", () => {
  it("requests the relative events path with no query when no filters are given", async () => {
    const fetchMock = vi.fn(async () => jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchEvents("tok")).resolves.toEqual([]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/events");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("serializes venue and period filters into the query string", async () => {
    const fetchMock = vi.fn(async () => jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await fetchEvents("tok", {
      accountId: "acc-1",
      venueId: "venue-1",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-14",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "/api/v1/events?account_id=acc-1&venue_id=venue-1&period_start=2026-08-01&period_end=2026-08-14",
    );
  });

  it("throws an ApiError carrying the backend detail on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ detail: "No autorizado" }, 403)),
    );
    await expect(fetchEvents("tok")).rejects.toMatchObject({ status: 403, message: "No autorizado" });
  });
});

describe("submitLead", () => {
  const payload = {
    name: "Prueba",
    phone: "+57 300 000 0000",
    birth_date: "1998-05-20",
    email: "prueba@example.com",
    source: "captura-web",
  };

  it("POSTs to the public leads path without an auth header and returns the redirect", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ id: "lead-1", redirect_url: "https://discover-co.com" }, 201),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitLead(payload)).resolves.toEqual({
      id: "lead-1",
      redirect_url: "https://discover-co.com",
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/leads");
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
    expect(JSON.parse(init?.body as string)).toEqual(payload);
  });

  it("throws an ApiError carrying the backend detail on a 422", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ detail: "value is not a valid email address" }, 422)),
    );
    await expect(submitLead(payload)).rejects.toMatchObject({ status: 422 });
    await expect(submitLead(payload)).rejects.toBeInstanceOf(ApiError);
  });
});

describe("fetchEvent", () => {
  it("requests the event detail path by id", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ event: { event_id: "evt-1" }, performance: {} }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchEvent("tok", "evt-1");
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/events/evt-1");
  });

  it("appends account_id when provided", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ event: { event_id: "evt-1" }, performance: {} }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchEvent("tok", "evt-1", "acc-9");
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/events/evt-1?account_id=acc-9");
  });
});
