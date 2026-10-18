import type { ReactNode } from "react";

export function ChartBlock({
  title,
  definition,
  children,
}: {
  title: string;
  definition: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-card" style={{ padding: "1.6rem 1.45rem", marginBottom: "1.35rem" }}>
      <h2
        className="font-glora"
        style={{
          color: "var(--color-ink)",
          fontSize: "var(--step-lead)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          margin: "0 0 0.4rem",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <p
        className="font-glora"
        style={{
          color: "var(--color-muted)",
          margin: "0 0 1.4rem",
          fontSize: "var(--step-small)",
          lineHeight: 1.5,
        }}
      >
        {definition}
      </p>
      {children}
    </section>
  );
}
