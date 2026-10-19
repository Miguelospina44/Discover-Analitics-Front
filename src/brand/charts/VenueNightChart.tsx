"use client";

import type { ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame } from "@/brand/ChartFrame";
import { chartSeries, chartTheme, chartTooltipStyle } from "@/brand/chart-tokens";
import { formatNightTick } from "@/lib/metrics";

type Props = {
  rows: Record<string, string | number>[];
  venueKeys: string[];
  venueLabels: Record<string, string>;
  venueIdByKey: Record<string, string>;
  activeVenueId?: string | null;
  onToggleVenue?: (venueId: string) => void;
  ariaLabel: string;
  yTickFormatter?: (value: number) => string;
  tooltipFormatter: (value: number, name: string) => [ReactNode, string];
};

export function VenueNightChart({
  rows,
  venueKeys,
  venueLabels,
  venueIdByKey,
  activeVenueId,
  onToggleVenue,
  ariaLabel,
  yTickFormatter,
  tooltipFormatter,
}: Props) {
  return (
    <ChartFrame label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%" minHeight={240}>
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 4 }} accessibilityLayer>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} strokeDasharray="0" />
          <XAxis
            dataKey="night_date"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => formatNightTick(v)}
          />
          <YAxis
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={yTickFormatter}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={{ color: chartTheme.tooltipText }}
            itemStyle={{ color: chartTheme.tooltipText }}
            labelFormatter={(label) => formatNightTick(String(label))}
            formatter={(value, name) => tooltipFormatter(Number(value), String(name))}
          />
          <Legend
            wrapperStyle={{ cursor: onToggleVenue ? "pointer" : undefined }}
            formatter={(value) => (
              <span className="text-xs text-[var(--discover-cloud)]">{value}</span>
            )}
            onClick={(e) => {
              const dataKey = String(e.dataKey ?? "");
              const venueId = venueIdByKey[dataKey];
              if (venueId && onToggleVenue) onToggleVenue(venueId);
            }}
          />
          {venueKeys.map((key, i) => {
            const venueId = venueIdByKey[key];
            const dimmed = Boolean(activeVenueId && activeVenueId !== venueId);
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={venueLabels[key] ?? key}
                stroke={chartSeries[i % chartSeries.length]}
                strokeWidth={2.25}
                strokeOpacity={dimmed ? 0.22 : 1}
                isAnimationActive={false}
                dot={false}
                activeDot={false}
                style={{ cursor: onToggleVenue ? "pointer" : undefined }}
                onClick={() => {
                  if (venueId && onToggleVenue) onToggleVenue(venueId);
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
