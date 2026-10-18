"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiscoverLogo } from "@/brand/DiscoverLogo";
import { DashboardSkeleton } from "@/brand/Skeleton";
import { copy } from "@/copy";
import { useAuth } from "@/lib/auth";
import { ApiError, DEMO_LOGINS } from "@/lib/types";

export default function LoginPage() {
  const { token, ready, isDemo, login, enterDemo } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>(DEMO_LOGINS[0].email);
  const [password, setPassword] = useState<string>(DEMO_LOGINS[0].password);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && (token || isDemo)) router.replace("/");
  }, [ready, token, isDemo, router]);

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

  if (!ready || token || isDemo) {
    return (
      <main className="page-wrap">
        <p className="page-kicker">{copy.loading}</p>
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "70dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-page)",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="surface-card"
        style={{ width: "100%", maxWidth: 420, padding: "2.25rem 1.75rem" }}
      >
        <div style={{ marginBottom: "1.35rem" }}>
          <DiscoverLogo variant="primary" />
        </div>
        <h1 className="page-title" style={{ fontSize: "1.65rem" }}>
          {copy.login.title}
        </h1>
        <p className="page-lead" style={{ marginBottom: "1.5rem" }}>
          {copy.login.intro}
        </p>
        <p className="field-label">{copy.login.demoHint}</p>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
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
        <label className="field-label" htmlFor="login-email">
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
        <label className="field-label" htmlFor="login-password">
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
          style={{ marginBottom: "1.25rem" }}
        />
        {error ? (
          <p className="status-error font-glora" style={{ marginBottom: "1rem" }} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-discover" style={{ width: "100%" }} disabled={pending}>
          {pending ? copy.login.submitting : copy.login.submit}
        </button>
        <button
          type="button"
          className="btn-quiet"
          style={{ width: "100%", marginTop: "0.65rem" }}
          onClick={() => {
            enterDemo();
            router.replace("/");
          }}
        >
          {copy.login.preview}
        </button>
      </form>
    </main>
  );
}
