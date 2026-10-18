import { copy } from "@/copy";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: string;
  hint: string;
  tone: "up" | "down" | "muted";
};

export function SectorCompare({
  attendance,
  orders,
}: {
  attendance: Stat;
  orders: Stat;
}) {
  return (
    <section className="mb-10" aria-labelledby="sector-heading">
      <h2 id="sector-heading" className="page-section-title">
        {copy.dashboard.sector.title}
      </h2>
      <p className="mt-1.5 max-w-[40rem] text-[length:var(--step-small)] leading-relaxed text-muted-foreground">
        {copy.dashboard.sector.note}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-8 min-[720px]:grid-cols-2">
        <SectorStat {...attendance} />
        <SectorStat {...orders} />
      </div>
      <p className="mt-6 max-w-[40rem] text-[length:var(--step-small)] leading-relaxed text-muted-foreground">
        {copy.dashboard.sector.revenuePending}
      </p>
    </section>
  );
}

function SectorStat({ label, value, hint, tone }: Stat) {
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div className="mt-2 font-normal text-[1.75rem] leading-none tabular-nums tracking-[-0.02em] text-foreground">
        {value}
      </div>
      <p
        className={cn(
          "mt-2 text-[length:var(--step-small)] leading-snug",
          tone === "up" && "delta-up",
          tone === "down" && "delta-down",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {hint}
      </p>
    </div>
  );
}
