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
    <section className="surface-card mb-6 px-6 py-6">
      <h2 className="page-section-title">{title}</h2>
      <p className="mb-5 mt-1.5 max-w-[42rem] text-[length:var(--step-small)] leading-relaxed text-muted-foreground">
        {definition}
      </p>
      {children}
    </section>
  );
}
