export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="surface-card" style={{ padding: "1.35rem" }}>
            <div className="skeleton skeleton-pulse" style={{ height: 12, width: "42%" }} />
            <div
              className="skeleton skeleton-pulse"
              style={{ height: 36, width: "70%", marginTop: "1.1rem" }}
            />
          </div>
        ))}
      </div>
      <div className="surface-card" style={{ padding: "1.6rem", minHeight: 280 }}>
        <div className="skeleton skeleton-pulse" style={{ height: 18, width: "48%" }} />
        <div
          className="skeleton skeleton-pulse"
          style={{ height: 180, width: "100%", marginTop: "1.4rem" }}
        />
      </div>
    </div>
  );
}
