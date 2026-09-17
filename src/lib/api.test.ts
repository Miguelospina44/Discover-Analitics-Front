import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, login } from "./api";
import { ApiError } from "./types";

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
