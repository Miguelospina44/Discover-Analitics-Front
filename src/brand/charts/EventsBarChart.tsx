"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartFrame } from "../ChartFrame";

type DataPoint = {
  label: string;
  value: number;
};

type Props = {
  data: DataPoint[];
  horizontal?: boolean;
  color?: string;
  label?: string;
};

export function EventsBarChart({
  data,
  horizontal = false,
  color = "var(--chart-1)",
  label = "Gráfico de barras",
}: Props) {
  if (data.length === 0) {
    return (
      <ChartFrame label={label}>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Sin datos disponibles
        </div>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 10, bottom: horizontal ? 10 : 40, left: horizontal ? 100 : 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          {horizontal ? (
            <>
              <XAxis type="number" stroke="var(--muted-foreground)" />
              <YAxis
                type="category"
                dataKey="label"
                stroke="var(--muted-foreground)"
                width={90}
                tick={{ fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="var(--muted-foreground)" />
            </>
          )}
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
