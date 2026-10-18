"use client";

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

import { chartSeries, chartTheme, chartTooltipStyle } from "@/brand/chart-tokens";

type Props = {
  rows: Record<string, string | number>[];
  venueKeys: string[];
  venueLabels: Record<string, string>;
  venueIdByKey: Record<string, string>;
  activeVenueId?: string | null;
  onToggleVenue?: (venueId: string) => void;
};

function hushFocus(e: { preventDefault: () => void }) {
  e.preventDefault();
}

function blurActive() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

export function NightlyAttendanceChart({
  rows,
  venueKeys,
  venueLabels,
  venueIdByKey,
  activeVenueId,
  onToggleVenue,
}: Props) {
  return (
    <div
      className="chart-crossfilter"
      style={{ width: "100%", height: 300 }}
      onMouseDown={hushFocus}
    >
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} strokeDasharray="0" />
          <XAxis
            dataKey="night_date"
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fill: chartTheme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={{ color: chartTheme.tooltipText }}
            itemStyle={{ color: chartTheme.tooltipText }}
          />
          <Legend
            wrapperStyle={{ cursor: onToggleVenue ? "pointer" : undefined }}
            formatter={(value) => (
              <span style={{ color: chartTheme.axis, fontSize: 12 }}>{value}</span>
            )}
            onClick={(e) => {
              const dataKey = String(e.dataKey ?? "");
              const venueId = venueIdByKey[dataKey];
              if (venueId && onToggleVenue) onToggleVenue(venueId);
              blurActive();
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
                  blurActive();
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
