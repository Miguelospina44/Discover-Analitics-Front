"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  ChartLine,
  CurrencyCircleDollar,
  List,
  Ticket,
  TrendUp,
  Users,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { copy } from "@/copy";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: PhosphorIcon;
  roles?: string[];
};

const navItems: NavItem[] = [
  {
    id: "summary",
    label: copy.nav.tabs.summary,
    href: "/",
    icon: ChartLine,
  },
  {
    id: "sales",
    label: copy.nav.tabs.sales,
    href: "/ventas",
    icon: CurrencyCircleDollar,
  },
  {
    id: "audience",
    label: copy.nav.tabs.audience,
    href: "/audiencia",
    icon: Users,
  },
  {
    id: "trends",
    label: copy.nav.tabs.trends,
    href: "/tendencias",
    icon: TrendUp,
  },
  {
    id: "events",
    label: copy.nav.tabs.events,
    href: "/eventos",
    icon: Ticket,
    roles: ["super_admin", "collective"],
  },
];

function useVisibleNavItems() {
  const { me, isDemo } = useAuth();
  return navItems.filter((item) => {
    if (!item.roles) return true;
    if (isDemo && item.id === "events") return true;
    return Boolean(me?.role && item.roles.includes(me.role));
  });
}

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = useVisibleNavItems();

  return (
    <nav aria-label={copy.nav.menu} className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center rounded-lg py-2.5 text-sm font-glora-l transition-colors",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
          >
            <Icon size={20} weight="regular" aria-hidden />
            {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:border-r lg:border-[var(--discover-slate)] lg:bg-[var(--surface)] lg:pt-[4.5rem]",
        collapsed ? "lg:w-[4.5rem]" : "lg:w-64",
      )}
    >
      <NavLinks collapsed={collapsed} />
      <div className="border-t border-[var(--discover-slate)] p-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? copy.nav.expand : copy.nav.collapse}
        >
          {collapsed ? (
            <CaretRight size={18} weight="regular" aria-hidden />
          ) : (
            <>
              <CaretLeft size={18} weight="regular" aria-hidden />
              <span className="ml-2">{copy.nav.collapse}</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="lg:hidden" aria-label={copy.nav.menu}>
          <List size={20} weight="regular" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-[var(--discover-slate)] px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-glora text-base">{copy.nav.menu}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="h-auto w-auto p-1" aria-label="Cerrar">
                <X size={16} weight="regular" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <NavLinks onNavigate={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
