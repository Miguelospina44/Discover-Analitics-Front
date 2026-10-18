"use client";

import { VenueNightChart } from "@/brand/charts/VenueNightChart";
import { copy } from "@/copy";
import { formatAxisCompact, formatMoney } from "@/lib/metrics";

type Props = {
  rows: Record<string, string | number>[];
  venueKeys: string[];
  venueLabels: Record<string, string>;
  venueIdByKey: Record<string, string>;
  activeVenueId?: string | null;
  onToggleVenue?: (venueId: string) => void;
};

export function SalesByNightChart(props: Props) {
  return (
    <VenueNightChart
      {...props}
      ariaLabel={`${copy.charts.sales.title}. ${copy.charts.cop}.`}
      yTickFormatter={(value) => formatAxisCompact(value)}
      tooltipFormatter={(value, name) => [formatMoney(value), name]}
    />
  );
}
