"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiscoverLogo } from "@/brand/DiscoverLogo";
import { useAuth } from "@/lib/auth";
import { ApiError, DEMO_LOGINS } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: 999,
  border: "1px solid var(--discover-line-strong)",
  background: "var(--discover-paper)",
  color: "var(--discover-ink)",
  fontFamily: "var(--font-ui)",
  fontWeight: 400,
  marginBottom: "1rem",
};

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
      else setError("No pudimos conectar con el API. ¿Está arriba en :8000?");
    } finally {
      setPending(false);
    }
  }

  if (!ready || token) {
    return (
      <main style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p className="font-glora-l" style={{ color: "var(--discover-storm)" }}>
          Cargando el parche…
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
        padding: "2rem 1.25rem",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="surface-card"
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "2rem 1.5rem",
          boxShadow: "var(--glow-violet)",
          borderTop: "3px solid var(--discover-yellow)",
        }}
      >
        <div style={{ marginBottom: "1.75rem" }}>
          <DiscoverLogo variant="primary" />
        </div>
        <p className="font-glora-l" style={{ color: "var(--discover-ink-soft)", marginBottom: "1rem" }}>
          Entrá al estudio. De panas a panas.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {DEMO_LOGINS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword(demo.password);
                setError(null);
              }}
              className="font-glora"
              style={{
                border: "1px solid var(--discover-line-strong)",
                background:
                  email === demo.email ? "var(--discover-yellow)" : "var(--discover-paper)",
                color: "var(--discover-obsidian)",
                borderRadius: 999,
                padding: "0.4rem 0.85rem",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {demo.label}
            </button>
          ))}
        </div>
        <label className="font-glora-xl" style={{ display: "block", color: "var(--discover-storm)", marginBottom: 6 }}>
          Correo
        </label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <label className="font-glora-xl" style={{ display: "block", color: "var(--discover-storm)", marginBottom: 6 }}>
          Clave
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ ...inputStyle, marginBottom: "1.35rem" }}
        />
        {error ? (
          <p
            className="font-glora"
            style={{ color: "var(--discover-tomato)", marginBottom: "1rem", fontSize: "0.9rem" }}
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-discover" style={{ width: "100%" }} disabled={pending}>
          {pending ? "Entrando…" : "Entrar al parche"}
        </button>
      </form>
    </main>
  );
}
