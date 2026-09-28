"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartSeries } from "@/brand/chart-tokens";
import type { AudienceSegment } from "@/lib/types";

type Props = {
  segments: AudienceSegment[];
  /** Etiquetas amigables por bucket (español). */
  labels?: Record<string, string>;
  /** Color de la serie; por defecto el amarillo legible de marca. */
  color?: string;
};

function labelFor(key: string, labels?: Record<string, string>): string {
  return labels?.[key] ?? key;
}

export function AudienceSegmentChart({ segments, labels, color }: Props) {
  const data = segments.map((s) => ({
    key: s.key,
    name: labelFor(s.key, labels),
    headcount: s.headcount,
    pctLabel: `${(s.share * 100).toFixed(0)}%`,
  }));

  const barColor = color ?? chartSeries[0];
  // Altura proporcional al número de buckets para que las barras respiren.
  const height = Math.max(160, data.length * 46);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
          barCategoryGap="28%"
        >
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            cursor={{ fill: "rgba(17,17,17,0.04)" }}
            formatter={(value) => [Number(value).toLocaleString("es-CO"), "Personas"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(17,17,17,0.08)",
              background: "rgba(255,255,255,0.95)",
            }}
          />
          <Bar dataKey="headcount" radius={[0, 8, 8, 0]} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={barColor} />
            ))}
            <LabelList
              dataKey="pctLabel"
              position="right"
              style={{ fill: "var(--discover-ink-soft)", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
