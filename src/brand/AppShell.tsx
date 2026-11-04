"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { copy, roleLabel } from "@/copy";
import { useAuth } from "@/lib/auth";
import { DiscoverLogo } from "./DiscoverLogo";
import { DemoRoleSwitch } from "./DemoRoleSwitch";
import { DesktopSidebar, MobileNav } from "./NavSidebar";

const COLLAPSE_KEY = "da_nav_collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const { token, me, ready, isDemo, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = Boolean((ready && token) || isDemo);
  const isAccessScreen = pathname === "/login";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const onToggle = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

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
      {signedIn ? <DesktopSidebar collapsed={collapsed} onToggle={onToggle} /> : null}
      <div className={signedIn ? (collapsed ? "shell-content lg:ml-[4.5rem]" : "shell-content lg:ml-64") : "shell-content"}>
        <a className="skip-link" href="#contenido">
          {copy.skipToContent}
        </a>
        <header className="shell-header sticky top-0 z-20 flex items-center justify-between gap-4 px-[var(--space-page)] py-[0.9rem]">
          <div className="flex items-center gap-3">
            {signedIn ? <MobileNav /> : null}
            <Link href="/" className="text-inherit no-underline">
              <DiscoverLogo variant="compact" />
            </Link>
          </div>
          <nav
            className="font-glora flex flex-wrap items-center justify-end gap-3 text-[0.9rem]"
            aria-label={copy.nav.session}
          >
            <DemoRoleSwitch />
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
