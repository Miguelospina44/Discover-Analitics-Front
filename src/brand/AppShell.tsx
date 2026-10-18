"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { copy, roleLabel } from "@/copy";
import { useAuth } from "@/lib/auth";
import { DiscoverLogo } from "./DiscoverLogo";

export function AppShell({ children }: { children: ReactNode }) {
  const { token, me, ready, isDemo, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = Boolean((ready && token) || isDemo);
  const isAccessScreen = pathname === "/login";

  if (isAccessScreen) {
    return (
      <div className="relative min-h-dvh bg-[var(--bg-deep)]">
        <div className="shell-content">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="app-backdrop" aria-hidden />
      <div className="shell-content">
        <header className="shell-header sticky top-0 z-20 flex items-center justify-between gap-4 px-[var(--space-page)] py-[0.9rem]">
          <Link href="/" className="text-inherit no-underline">
            <DiscoverLogo variant="compact" />
          </Link>
          <nav
            className="font-glora flex flex-wrap items-center justify-end gap-3 text-[0.9rem]"
            aria-label={copy.nav.session}
          >
            {ready && me ? (
              <span className="shell-account">
                {me.account_name ?? copy.nav.accountFallback}
                {" · "}
                {roleLabel(me.role)}
              </span>
            ) : null}
            {signedIn ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                <SignOut size={16} weight="regular" aria-hidden />
                {copy.nav.signOut}
              </Button>
            ) : (
              <Link href="/login" className="text-muted-foreground">
                {copy.nav.signIn}
              </Link>
            )}
          </nav>
        </header>
        {children}
        <footer className="font-glora px-[var(--space-page)] py-10 text-[length:var(--step-small)] text-muted-foreground">
          {copy.footer}
        </footer>
      </div>
    </div>
  );
}
