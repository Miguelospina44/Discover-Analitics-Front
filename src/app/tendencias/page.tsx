"use client";

import { Info, WarningCircle } from "@phosphor-icons/react";
import { FilterBar } from "@/brand/FilterBar";
import { KpiStat } from "@/brand/KpiStat";
import { SectorCompare } from "@/brand/SectorCompare";
import { DashboardSkeleton } from "@/brand/Skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/copy";
import { formatAverage } from "@/lib/metrics";
import { useDashboardData } from "@/lib/use-dashboard-data";

export default function TendenciasPage() {
  const data = useDashboardData();

  if (!data.ready || !data.signedIn || !data.me) {
    return (
      <main id="contenido" className="page-wrap" tabIndex={-1}>
        <p className="page-kicker">{copy.loading}</p>
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main id="contenido" className="page-wrap" tabIndex={-1} aria-label={copy.nav.tabs.trends}>
      <h1 className="page-title">{copy.nav.tabs.trends}</h1>
      <p className="page-lead">{copy.trendsPage.intro}</p>
      <div className="meta-row">
        <span>{data.periodLabel}</span>
        <span>{data.scopeLabel}</span>
        {data.refreshing ? <span>{copy.refreshing}</span> : null}
      </div>

      {data.isDemo ? (
        <Alert className="mt-6 mb-6" role="status">
          <Info size={16} weight="regular" aria-hidden />
          <AlertDescription>{copy.demo.banner}</AlertDescription>
        </Alert>
      ) : (
        <div className="h-6" />
      )}

      <FilterBar isSuperAdmin={Boolean(data.showClientPicker)} accounts={data.accounts} venues={data.venues} />

      {data.bootLoading ? <DashboardSkeleton /> : null}

      {data.error ? (
        <Alert variant="destructive" className="mb-8">
          <WarningCircle size={16} weight="regular" aria-hidden />
          <AlertDescription className="text-destructive">
            <span className="block mb-3">{data.error}</span>
            <Button type="button" onClick={() => void data.load()}>
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!data.error && !data.bootLoading && data.attendance && data.sales ? (
        <div className={data.refreshing ? "opacity-80 transition-opacity duration-[var(--dur-fast)]" : ""}>
          <section className="kpi-stage mb-10" aria-label={copy.nav.tabs.trends}>
            <KpiStat
              label={copy.dashboard.sector.attendance}
              value={formatAverage(data.avgAttendance ?? data.bench?.avg_tickets_per_venue_night ?? 0)}
              hint={data.attendanceDelta.text}
              hintTone={data.attendanceDelta.tone}
            />
            <KpiStat
              label={copy.dashboard.sector.orders}
              value={formatAverage(data.avgOrders ?? data.bench?.avg_orders_per_venue_night ?? 0)}
              hint={data.ordersDelta.text}
              hintTone={data.ordersDelta.tone}
            />
          </section>

          {data.bench ? (
            <SectorCompare
              attendance={{
                label: copy.dashboard.sector.attendance,
                value: formatAverage(data.avgAttendance ?? data.bench.avg_tickets_per_venue_night),
                hint: data.attendanceDelta.text,
                tone: data.attendanceDelta.tone,
              }}
              orders={{
                label: copy.dashboard.sector.orders,
                value: formatAverage(data.avgOrders ?? data.bench.avg_orders_per_venue_night),
                hint: data.ordersDelta.text,
                tone: data.ordersDelta.tone,
              }}
            />
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
