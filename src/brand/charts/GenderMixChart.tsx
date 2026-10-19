"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartFrame } from "@/brand/ChartFrame";
import { chartTheme, chartTooltipStyle, genderSeriesColors } from "@/brand/chart-tokens";
import { copy, genderLabel } from "@/copy";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/metrics";
import type { GenderPoint } from "@/lib/types";

type Props = {
  points: GenderPoint[];
  activeGender?: string | null;
  onToggleGender?: (gender: string) => void;
};

export function GenderMixChart({ points, activeGender, onToggleGender }: Props) {
  const data = points.map((s) => ({
    key: s.gender,
    name: genderLabel(s.gender),
    value: s.headcount,
    share: Math.round(s.share * 100),
  }));

  const ariaLabel = `${copy.charts.gender.title}. ${copy.charts.people}.`;

  return (
    <>
      <ChartFrame label={ariaLabel} className="hidden min-[720px]:block">
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <PieChart accessibilityLayer>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={98}
              paddingAngle={3}
              stroke={chartTheme.tooltipBg}
              strokeWidth={3}
              isAnimationActive={false}
              cursor={onToggleGender ? "pointer" : undefined}
              onClick={(_, index) => {
                const slice = data[index];
                if (slice && onToggleGender) onToggleGender(slice.key);
              }}
            >
              {data.map((entry) => {
                const base = genderSeriesColors[entry.key] ?? chartTheme.series[3];
                const dimmed = Boolean(activeGender && activeGender !== entry.key);
                return (
                  <Cell
                    key={entry.key}
                    fill={base}
                    fillOpacity={dimmed ? 0.28 : 1}
                    stroke={chartTheme.tooltipBg}
                    strokeWidth={2}
                  />
                );
              })}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCount(Number(value)), copy.charts.people]}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: chartTheme.tooltipText }}
              itemStyle={{ color: chartTheme.tooltipText }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="pr-2.5 text-xs text-[var(--discover-cloud)]">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ul className="flex flex-col gap-3 min-[720px]:hidden" aria-label={ariaLabel}>
        {data.map((entry) => {
          const color = genderSeriesColors[entry.key] ?? chartTheme.series[3];
          const dimmed = Boolean(activeGender && activeGender !== entry.key);
          return (
            <li key={entry.key}>
              <button
                type="button"
                className="w-full min-h-11 rounded-md text-left"
                onClick={() => onToggleGender?.(entry.key)}
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground">{entry.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {entry.share} % · {formatCount(entry.value)}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-md bg-[var(--bg-deep)]">
                  <div
                    className={cn("h-full rounded-md", dimmed && "opacity-30")}
                    style={{ width: `${entry.share}%`, background: color }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
