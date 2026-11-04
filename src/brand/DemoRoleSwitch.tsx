"use client";

import { copy } from "@/copy";
import { useAuth } from "@/lib/auth";

const ROLE_VALUES = ["super_admin", "collective", "account_owner"] as const;

export function DemoRoleSwitch() {
  const { isDemo, me, enterDemo } = useAuth();
  if (!isDemo || !me) return null;

  return (
    <label className="flex min-w-0 items-center gap-2 text-[length:var(--step-small)] text-muted-foreground">
      <span className="hidden sm:inline">{copy.demo.viewLabel}</span>
      <select
        className="input-field h-9 max-w-[11rem] py-0 text-sm"
        value={me.role}
        aria-label={copy.demo.viewLabel}
        onChange={(event) => enterDemo(event.target.value)}
      >
        {ROLE_VALUES.map((role) => (
          <option key={role} value={role}>
            {copy.demo.roles[role]}
          </option>
        ))}
      </select>
    </label>
  );
}
