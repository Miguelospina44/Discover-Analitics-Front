export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="surface-card" style={{ padding: "1.35rem 1.25rem", minWidth: 0 }}>
      <div className="kpi-label" style={{ marginBottom: "0.85rem" }}>
        {label}
      </div>
      <div className="kpi-number" title={value}>
        {value}
      </div>
      {hint ? (
        <div
          className="font-glora"
          style={{
            marginTop: "0.7rem",
            fontSize: "var(--step-small)",
            color: "var(--color-muted)",
          }}
        >
          {hint}
        </div>
      ) : null}
    </article>
  );
}
