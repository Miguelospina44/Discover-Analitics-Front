"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { DiscoverLogo } from "./DiscoverLogo";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { token, me, ready, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="app-backdrop" aria-hidden>
        <div className="bg-orbs">
          <span className="bg-orbs__blob bg-orbs__blob--yellow" />
          <span className="bg-orbs__blob bg-orbs__blob--plum" />
          <span className="bg-orbs__blob bg-orbs__blob--ink" />
          <span className="bg-orbs__blob bg-orbs__blob--fog" />
        </div>
      </div>

      <div className="shell-content">
        <header
          className="shell-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1.1rem 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Link href="/" style={{ textDecoration: "none", borderBottom: "none" }}>
            <DiscoverLogo variant="secondary" />
          </Link>
          <nav
            className="font-glora"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              fontSize: "0.9rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {ready && me ? (
              <span className="font-glora-xl" style={{ color: "var(--discover-storm)", fontSize: "0.75rem" }}>
                {me.account_name ?? "cuenta"} · {me.role}
              </span>
            ) : null}
            <Link href="/" style={{ color: "var(--discover-ink)" }}>
              Estudios
            </Link>
            {ready && token ? (
              <Link href="/events" style={{ color: "var(--discover-ink)" }}>
                Eventos
              </Link>
            ) : null}
            {ready && token ? (
              <Link href="/tableros" style={{ color: "var(--discover-ink)" }}>
                Tableros
              </Link>
            ) : null}
            {ready && token ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--discover-storm)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Salir
              </button>
            ) : (
              <Link href="/login" style={{ color: "var(--discover-storm)" }}>
                Entrar
              </Link>
            )}
          </nav>
        </header>
        {children}
        <footer
          className="font-glora-xl"
          style={{
            padding: "2rem 1.5rem",
            borderTop: "1px solid rgba(228, 226, 218, 0.8)",
            color: "var(--discover-storm)",
            fontSize: "0.75rem",
            letterSpacing: "0.06em",
          }}
        >
          La noche está en DISCOVER · Analytics para el parche
        </footer>
      </div>
    </div>
  );
}
