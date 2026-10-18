"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiscoverLogo } from "./DiscoverLogo";
import { copy, roleLabel } from "@/copy";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { token, me, ready, logout } = useAuth();
  const router = useRouter();

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
            padding: "1rem 1.6rem",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Link href="/" style={{ textDecoration: "none", borderBottom: "none" }}>
            <DiscoverLogo variant="compact" />
          </Link>
          <nav
            className="font-glora"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              fontSize: "0.88rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {ready && me ? (
              <span className="font-glora-xl" style={{ color: "var(--discover-cloud)", fontSize: "0.75rem" }}>
                {me.account_name ?? copy.nav.accountFallback} · {roleLabel(me.role)}
              </span>
            ) : null}
            <Link href="/" style={{ color: "var(--discover-pearl)" }}>
              {copy.nav.panel}
            </Link>
            {ready && token ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--discover-cloud)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 400,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {copy.nav.signOut}
              </button>
            ) : (
              <Link href="/login" style={{ color: "var(--discover-cloud)" }}>
                {copy.nav.signIn}
              </Link>
            )}
          </nav>
        </header>
        {children}
        <footer
          className="font-glora-xl"
          style={{
            padding: "2.25rem 1.6rem",
            borderTop: "1px solid rgba(180, 187, 200, 0.12)",
            color: "var(--discover-cloud)",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {copy.footer}
        </footer>
      </div>
    </div>
  );
}
