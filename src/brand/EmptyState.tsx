"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ title, body, action, compact }: EmptyStateProps) {
  const Heading = compact ? "h3" : "h2";
  return (
    <div className={compact ? "max-w-[35rem] py-4" : "surface-card max-w-[35rem] px-7 py-11"}>
      <Heading className={compact ? "text-[length:var(--step-body)] text-foreground" : "page-section-title"}>
        {title}
      </Heading>
      <p className="font-glora-l mb-6 mt-3 leading-relaxed text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
