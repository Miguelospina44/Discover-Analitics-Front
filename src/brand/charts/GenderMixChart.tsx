"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { GenderPoint } from "@/lib/types";

const COLORS: Record<string, string> = {
  woman: "#F3F188",
  man: "#111111",
  other: "#9CA3AF",
  undisclosed: "#D1D5DB",
};

const LABELS: Record<string, string> = {
  woman: "Mujer",
  man: "Hombre",
  other: "Otro",
  undisclosed: "No especificado",
};

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
    name: LABELS[s.gender] ?? s.gender,
    value: s.headcount,
  }));

  return (
    <div
      className="chart-crossfilter"
      style={{ width: "100%", height: 280 }}
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
            innerRadius={58}
            outerRadius={96}
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
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
              const base = COLORS[entry.key] ?? "#CBD5E1";
              const dimmed = Boolean(activeGender && activeGender !== entry.key);
              return (
                <Cell
                  key={entry.key}
                  fill={base}
                  fillOpacity={dimmed ? 0.35 : 1}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            })}
          </Pie>
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString("es-CO"), "Personas"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(17,17,17,0.08)",
              background: "rgba(255,255,255,0.95)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: "var(--discover-ink-soft)", fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
