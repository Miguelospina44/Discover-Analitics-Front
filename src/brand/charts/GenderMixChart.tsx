"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { chartTheme, chartTooltipStyle, genderSeriesColors } from "@/brand/chart-tokens";
import { copy, genderLabel } from "@/copy";
import type { GenderPoint } from "@/lib/types";

type Props = {
  points: GenderPoint[];
  activeGender?: string | null;
  onToggleGender?: (gender: string) => void;
};

function hushFocus(e: { preventDefault: () => void }) {
  e.preventDefault();
}

export function GenderMixChart({ points, activeGender, onToggleGender }: Props) {
  const data = points.map((s) => ({
    key: s.gender,
    name: genderLabel(s.gender),
    value: s.headcount,
  }));

  return (
    <div
      className="chart-crossfilter"
      style={{ width: "100%", height: 300 }}
      onMouseDown={hushFocus}
    >
      <ResponsiveContainer>
        <PieChart>
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
              if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
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
            formatter={(value) => [Number(value).toLocaleString("es-CO"), copy.charts.people]}
            contentStyle={chartTooltipStyle}
            labelStyle={{ color: chartTheme.tooltipText }}
            itemStyle={{ color: chartTheme.tooltipText }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: chartTheme.axis, fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
