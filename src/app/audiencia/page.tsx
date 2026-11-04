"use client";

import dynamic from "next/dynamic";
import { Info, WarningCircle } from "@phosphor-icons/react";
import { ChartBlock } from "@/brand/ChartBlock";
import { EmptyState } from "@/brand/EmptyState";
import { FilterBar } from "@/brand/FilterBar";
import { KpiStat } from "@/brand/KpiStat";
import { DashboardSkeleton } from "@/brand/Skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/copy";
import { formatAverage, formatCount } from "@/lib/metrics";
import { useDashboardData } from "@/lib/use-dashboard-data";

const GenderMixChart = dynamic(
  () => import("@/brand/charts/GenderMixChart").then((m) => m.GenderMixChart),
  { ssr: false },
);
const NightlyAttendanceChart = dynamic(
  () => import("@/brand/charts/NightlyAttendanceChart").then((m) => m.NightlyAttendanceChart),
  { ssr: false },
);

export default function AudienciaPage() {
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
    <main id="contenido" className="page-wrap" tabIndex={-1} aria-label={copy.nav.tabs.audience}>
      <h1 className="page-title">{copy.nav.tabs.audience}</h1>
      <p className="page-lead">{copy.audiencePage.intro}</p>
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

      {!data.error && !data.bootLoading && data.attendance ? (
        <div className={data.refreshing ? "opacity-80 transition-opacity duration-[var(--dur-fast)]" : ""}>
          <section className="kpi-stage mb-10" aria-label={copy.nav.tabs.audience}>
            <KpiStat
              hero
              label={copy.dashboard.kpis.attendance}
              value={formatCount(data.tickets)}
              hint={
                data.avgAttendance != null
                  ? copy.dashboard.kpis.perNight(formatAverage(data.avgAttendance))
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
          ) : (
            <>
              {data.attendancePivot ? (
                <ChartBlock title={copy.charts.attendance.title} definition={copy.charts.attendance.definition}>
                  <NightlyAttendanceChart
                    rows={data.attendancePivot.rows}
                    venueKeys={data.attendancePivot.venueKeys}
                    venueLabels={data.attendancePivot.venueLabels}
                    venueIdByKey={data.attendancePivot.venueIdByKey}
                    activeVenueId={data.venueId}
                    onToggleVenue={data.toggleVenueId}
                  />
                </ChartBlock>
              ) : null}
              {data.genderMeasure && data.genderMeasure.points.length > 0 ? (
                <ChartBlock title={copy.charts.gender.title} definition={copy.charts.gender.definition}>
                  <GenderMixChart
                    points={data.genderMeasure.points}
                    activeGender={data.gender}
                    onToggleGender={data.onToggleGender}
                  />
                </ChartBlock>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </main>
  );
}
