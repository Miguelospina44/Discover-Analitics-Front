"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartFrame } from "../ChartFrame";

type DataPoint = {
  label: string;
  value: number;
};

type Props = {
  data: DataPoint[];
  label?: string;
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--down)",
  "var(--up)",
];

export function EventsPieChart({ data, label = "Gráfico circular" }: Props) {
  if (data.length === 0) {
    return (
      <ChartFrame label={label}>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Sin datos disponibles
        </div>
      </ChartFrame>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.map((d) => ({
    name: d.label,
    value: d.value,
  }));

  return (
    <ChartFrame label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => {
              const percent = ((entry.value / total) * 100).toFixed(0);
              return `${entry.name}: ${percent}%`;
            }}
            outerRadius={80}
            fill="var(--chart-1)"
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "none",
              borderRadius: "var(--radius)",
              color: "var(--foreground)",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
