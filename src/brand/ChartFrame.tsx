import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div
      className={cn("chart-frame w-full", className)}
      role="img"
      aria-label={label}
    >
      {children}
    </div>
  );
}
