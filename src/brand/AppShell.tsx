"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { DiscoverLogo } from "./DiscoverLogo";
import { copy, roleLabel } from "@/copy";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { token, me, ready, isDemo, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = Boolean((ready && token) || isDemo);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <div className="app-backdrop" aria-hidden />
      <div className="shell-content">
        <header
          className="shell-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.9rem var(--space-page)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <DiscoverLogo variant="compact" />
          </Link>
          <nav
            className="font-glora"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.15rem",
              fontSize: "0.9rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {ready && me ? (
              <span className="shell-account">
                {me.account_name ?? copy.nav.accountFallback} · {roleLabel(me.role)}
              </span>
            ) : null}
            <Link
              href="/"
              style={{
                color: pathname === "/" ? "var(--color-ink)" : "var(--color-muted)",
              }}
            >
              {copy.nav.panel}
            </Link>
            {signedIn ? (
              <button
                type="button"
                className="btn-quiet"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                style={{ minHeight: "2.25rem", padding: "0.35rem 0.7rem" }}
              >
                <SignOut size={16} weight="regular" aria-hidden />
                {copy.nav.signOut}
              </button>
            ) : (
              <Link href="/login" style={{ color: "var(--color-muted)" }}>
                {copy.nav.signIn}
              </Link>
            )}
          </nav>
        </header>
        {children}
        <footer
          className="font-glora"
          style={{
            padding: "2.5rem var(--space-page)",
            color: "var(--color-muted)",
            fontSize: "var(--step-small)",
          }}
        >
          {copy.footer}
        </footer>
      </div>
    </div>
  );
}
