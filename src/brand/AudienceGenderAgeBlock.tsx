"use client";

import { Info } from "@phosphor-icons/react";
import { ChartBlock } from "@/brand/ChartBlock";
import { EmptyState } from "@/brand/EmptyState";
import { ChartSkeleton } from "@/brand/Skeleton";
import { Button } from "@/components/ui/button";
import { copy } from "@/copy";
import type { AudienceGenderAgeMeasure } from "@/lib/types";
import { AudienceGenderAgeChart } from "@/brand/charts/AudienceGenderAgeChart";

export type AudiencePanelState =
  | { status: "loading" }
  | { status: "restricted" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AudienceGenderAgeMeasure };

type Props = {
  state: AudiencePanelState;
  onRetry: () => void;
};

export function AudienceGenderAgeBlock({ state, onRetry }: Props) {
  if (state.status === "loading") {
    return <ChartSkeleton />;
  }

  if (state.status === "restricted") {
    return (
      <ChartBlock title={copy.charts.genderAge.title} definition={copy.charts.genderAge.definition}>
        <EmptyState
          compact
          title={copy.charts.genderAge.restrictedTitle}
          body={copy.charts.genderAge.restrictedBody}
        />
      </ChartBlock>
    );
  }

  if (state.status === "error") {
    return (
      <ChartBlock title={copy.charts.genderAge.title} definition={copy.charts.genderAge.definition}>
        <EmptyState
          compact
          title={copy.charts.genderAge.errorTitle}
          body={state.message}
          action={
            <Button type="button" onClick={onRetry}>
              {copy.retry}
            </Button>
          }
        />
      </ChartBlock>
    );
  }

  const { data } = state;

  if (data.data_quality === "missing") {
    return (
      <ChartBlock title={copy.charts.genderAge.title} definition={copy.charts.genderAge.definition}>
        <EmptyState
          compact
          title={copy.charts.genderAge.unavailableTitle}
          body={copy.charts.genderAge.unavailableBody}
        />
      </ChartBlock>
    );
  }

  if (data.suppressed || data.points.length === 0) {
    return (
      <ChartBlock title={copy.charts.genderAge.title} definition={copy.charts.genderAge.definition}>
        <EmptyState
          compact
          title={copy.charts.genderAge.privacyTitle}
          body={copy.charts.genderAge.privacyBody}
        />
      </ChartBlock>
    );
  }

  return (
    <ChartBlock
      title={copy.charts.genderAge.title}
      definition={copy.charts.genderAge.definition}
      notice={
        data.is_demo ? (
          <p role="status" className="mb-4 text-[length:var(--step-small)] leading-relaxed text-muted-foreground">
            <Info size={14} weight="regular" className="mr-1.5 inline -translate-y-px text-primary" aria-hidden />
            {data.demo_label ?? copy.charts.genderAge.demoFallback}
          </p>
        ) : null
      }
    >
      <AudienceGenderAgeChart points={data.points} />
    </ChartBlock>
  );
}
