import type { ReactNode } from "react";
import { DiscoverLogo } from "./DiscoverLogo";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div
      className="surface-card pattern-stamp"
      style={{
        padding: "2.5rem 1.75rem",
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
        <DiscoverLogo variant="mark" />
      </div>
      <h2
        className="font-blogh"
        style={{
          color: "var(--discover-obsidian)",
          fontSize: "1.15rem",
          margin: "0 0 0.85rem",
        }}
      >
        {title}
      </h2>
      <p
        className="font-glora-l"
        style={{ color: "var(--discover-ink-soft)", margin: "0 0 1.5rem", lineHeight: 1.55 }}
      >
        {body}
      </p>
      {action}
    </div>
  );
}
