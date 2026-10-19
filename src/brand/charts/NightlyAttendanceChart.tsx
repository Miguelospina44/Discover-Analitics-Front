"use client";

import { VenueNightChart } from "@/brand/charts/VenueNightChart";
import { copy } from "@/copy";
import { formatCount } from "@/lib/metrics";

type Props = {
  rows: Record<string, string | number>[];
  venueKeys: string[];
  venueLabels: Record<string, string>;
  venueIdByKey: Record<string, string>;
  activeVenueId?: string | null;
  onToggleVenue?: (venueId: string) => void;
};

export function NightlyAttendanceChart(props: Props) {
  return (
    <VenueNightChart
      {...props}
      ariaLabel={`${copy.charts.attendance.title}. ${copy.charts.people}.`}
      yTickFormatter={(value) => formatCount(value)}
      tooltipFormatter={(value, name) => [formatCount(value), name]}
    />
  );
}
