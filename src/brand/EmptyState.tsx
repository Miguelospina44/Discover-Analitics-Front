"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="surface-card max-w-[35rem] px-7 py-11">
      <h2 className="page-section-title">{title}</h2>
      <p className="font-glora-l mb-6 mt-3 leading-relaxed text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
