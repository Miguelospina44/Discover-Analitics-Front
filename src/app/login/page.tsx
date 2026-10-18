"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiscoverLogo } from "@/brand/DiscoverLogo";
import { copy } from "@/copy";
import { useAuth } from "@/lib/auth";
import { ApiError, DEMO_LOGINS } from "@/lib/types";

export default function LoginPage() {
  const { token, ready, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>(DEMO_LOGINS[0].email);
  const [password, setPassword] = useState<string>(DEMO_LOGINS[0].password);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && token) router.replace("/");
  }, [ready, token, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(copy.errors.apiUnreachable);
    } finally {
      setPending(false);
    }
  }

  if (!ready || token) {
    return (
      <main style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p className="font-glora-l" style={{ color: "var(--discover-cloud)" }}>
          {copy.loading}
        </p>
      </main>
    );
  }

  return (
    <main
      className="pattern-stamp"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.25rem",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="surface-card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2.25rem 1.75rem",
          boxShadow: "var(--glow-subtle)",
          borderTop: "2px solid var(--discover-champagne)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <DiscoverLogo variant="primary" />
        </div>
        <p
          className="font-glora-l"
          style={{
            color: "var(--discover-cloud)",
            marginBottom: "1.35rem",
            lineHeight: 1.55,
            fontSize: "0.98rem",
          }}
        >
          {copy.login.intro}
        </p>
        <p className="scope-picker__label" style={{ marginBottom: "0.55rem" }}>
          {copy.login.demoHint}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.35rem", flexWrap: "wrap" }}>
          {DEMO_LOGINS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword(demo.password);
                setError(null);
              }}
              className={`scope-chip${email === demo.email ? " scope-chip--active" : ""}`}
            >
              {demo.label}
            </button>
          ))}
        </div>
        <label
          className="font-glora-xl"
          htmlFor="login-email"
          style={{ display: "block", color: "var(--discover-cloud)", marginBottom: 6 }}
        >
          {copy.login.email}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
          style={{ marginBottom: "1rem" }}
        />
        <label
          className="font-glora-xl"
          htmlFor="login-password"
          style={{ display: "block", color: "var(--discover-cloud)", marginBottom: 6 }}
        >
          {copy.login.password}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
          style={{ marginBottom: "1.35rem" }}
        />
        {error ? (
          <p
            className="font-glora"
            style={{ color: "var(--discover-terracotta)", marginBottom: "1rem", fontSize: "0.9rem" }}
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-discover" style={{ width: "100%" }} disabled={pending}>
          {pending ? copy.login.submitting : copy.login.submit}
        </button>
      </form>
    </main>
  );
}
