import { cn } from "@/lib/utils";

type HintTone = "up" | "down" | "muted";

export function KpiStat({
  label,
  value,
  hint,
  hintTone = "muted",
  hero = false,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: HintTone;
  hero?: boolean;
}) {
  return (
    <article
      className={cn("surface-card min-w-0 px-5 py-5", hero && "kpi-hero")}
    >
      <div className="kpi-label mb-3">{label}</div>
      <div className="kpi-number" title={value}>
        {value}
      </div>
      {hint ? (
        <p
          className={cn(
            "mt-2.5 text-[length:var(--step-small)] leading-snug",
            hintTone === "up" && "delta-up",
            hintTone === "down" && "delta-down",
            hintTone === "muted" && "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </article>
  );
}
