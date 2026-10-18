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
        padding: "2.75rem 1.85rem",
        textAlign: "center",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.35rem" }}>
        <DiscoverLogo variant="mark" />
      </div>
      <h2
        className="font-blogh"
        style={{
          color: "var(--discover-pearl)",
          fontSize: "1.05rem",
          margin: "0 0 0.9rem",
        }}
      >
        {title}
      </h2>
      <p
        className="font-glora-l"
        style={{ color: "var(--discover-cloud)", margin: "0 0 1.6rem", lineHeight: 1.6 }}
      >
        {body}
      </p>
      {action}
    </div>
  );
}
