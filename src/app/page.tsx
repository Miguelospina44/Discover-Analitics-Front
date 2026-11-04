"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Info, WarningCircle } from "@phosphor-icons/react";
import { EmptyState } from "@/brand/EmptyState";
import { FilterBar } from "@/brand/FilterBar";
import { KpiStat } from "@/brand/KpiStat";
import { DashboardSkeleton } from "@/brand/Skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/copy";
import { formatAverage, formatCount, formatRevenueFromField } from "@/lib/metrics";
import { readVista, useDashboardData } from "@/lib/use-dashboard-data";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main id="contenido" className="page-wrap" tabIndex={-1}>
          <DashboardSkeleton />
        </main>
      }
    >
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const searchParams = useSearchParams();
  const data = useDashboardData(readVista(searchParams.get("vista")));

  if (!data.ready || !data.signedIn || !data.me) {
    return (
      <main id="contenido" className="page-wrap" tabIndex={-1}>
        <p className="page-kicker">{copy.loading}</p>
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main id="contenido" className="page-wrap" tabIndex={-1} aria-label={copy.main}>
      <h1 className="page-title">{copy.dashboard.title}</h1>
      <p className="page-lead">
        {data.isSuperAdmin ? copy.dashboard.introAdmin : copy.dashboard.introOwner}
      </p>
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
          <section className="kpi-stage mb-10" aria-label={copy.dashboard.title}>
            <KpiStat
              hero
              label={copy.dashboard.kpis.revenue}
              value={formatRevenueFromField(data.revenueCents)}
              hint={data.periodLabel}
            />
            <KpiStat
              label={copy.dashboard.kpis.attendance}
              value={formatCount(data.tickets)}
              hint={
                data.avgAttendance != null
                  ? copy.dashboard.kpis.perNight(formatAverage(data.avgAttendance))
                  : data.periodLabel
              }
            />
            <KpiStat
              label={copy.dashboard.kpis.orders}
              value={formatCount(data.orders)}
              hint={
                data.avgOrders != null
                  ? copy.dashboard.kpis.perNight(formatAverage(data.avgOrders))
                  : data.periodLabel
              }
            />
          </section>

          {data.empty ? (
            <EmptyState
              title={copy.dashboard.empty.title}
              body={copy.dashboard.empty.body}
              action={
                data.hasActiveFilters ? (
                  <Button type="button" variant="secondary" onClick={data.clear}>
                    {copy.filters.clear}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void data.load()}>
                    {copy.retry}
                  </Button>
                )
              }
            />
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
