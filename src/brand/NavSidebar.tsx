"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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

export function NavSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { me } = useAuth();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return me?.role && item.roles.includes(me.role);
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--discover-slate)] lg:bg-[var(--surface)] lg:pt-[4.5rem]">
        <nav aria-label={copy.nav.menu} className="flex-1 space-y-1 px-3 py-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-glora-l transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} weight="regular" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            aria-label={copy.nav.menu}
          >
            <List size={20} weight="regular" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-[var(--discover-slate)] px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-glora text-base">{copy.nav.menu}</SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-1"
                  aria-label="Cerrar"
                >
                  <X size={16} weight="regular" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <nav aria-label={copy.nav.menu} className="flex-1 space-y-1 px-3 py-4">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-glora-l transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} weight="regular" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
