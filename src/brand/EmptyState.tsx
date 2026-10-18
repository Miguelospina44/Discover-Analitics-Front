"use client";

import type { ReactNode } from "react";
import { ChartLine } from "@phosphor-icons/react";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div
      className="surface-card"
      style={{
        padding: "2.75rem 1.75rem",
        textAlign: "left",
        maxWidth: 560,
      }}
    >
      <ChartLine size={28} weight="regular" color="var(--color-brand)" aria-hidden />
      <h2
        className="font-glora"
        style={{
          color: "var(--color-ink)",
          fontSize: "var(--step-lead)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          margin: "1rem 0 0.7rem",
        }}
      >
        {title}
      </h2>
      <p
        className="font-glora-l"
        style={{ color: "var(--color-muted)", margin: "0 0 1.5rem", lineHeight: 1.6 }}
      >
        {body}
      </p>
      {action}
    </div>
  );
}
