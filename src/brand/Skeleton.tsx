export function ChartSkeleton() {
  return (
    <div
      className="surface-card mb-6 min-h-[16.25rem] px-6 py-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="skeleton skeleton-pulse h-4 w-[52%]" />
      <div className="skeleton skeleton-pulse mt-3 h-3 w-[78%]" />
      <div className="skeleton skeleton-pulse mt-6 h-[11.25rem] w-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="kpi-stage mb-6">
        <div className="surface-card kpi-hero px-5 py-5">
          <div className="skeleton skeleton-pulse h-3 w-[28%]" />
          <div className="skeleton skeleton-pulse mt-4 h-10 w-[62%]" />
          <div className="skeleton skeleton-pulse mt-3 h-3 w-[40%]" />
        </div>
        <div className="surface-card px-5 py-5">
          <div className="skeleton skeleton-pulse h-3 w-[42%]" />
          <div className="skeleton skeleton-pulse mt-4 h-8 w-[55%]" />
        </div>
        <div className="surface-card px-5 py-5">
          <div className="skeleton skeleton-pulse h-3 w-[42%]" />
          <div className="skeleton skeleton-pulse mt-4 h-8 w-[55%]" />
        </div>
      </div>
      <div className="surface-card min-h-[16.25rem] px-6 py-6">
        <div className="skeleton skeleton-pulse h-4 w-[48%]" />
        <div className="skeleton skeleton-pulse mt-6 h-[11.25rem] w-full" />
      </div>
    </div>
  );
}
