"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "../ChartFrame";
import { chartTheme, chartTooltipStyle } from "@/brand/chart-tokens";

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

function shorten(value: string, max = 22): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

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

  const rows = horizontal ? [...data].sort((a, b) => b.value - a.value).slice(0, 12) : data;

  return (
    <ChartFrame label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 12, bottom: horizontal ? 8 : 36, left: horizontal ? 8 : 8 }}
        >
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="0" vertical={!horizontal} horizontal={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                stroke={chartTheme.axis}
                width={128}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                tickFormatter={(value: string) => shorten(value)}
                tickLine={false}
                axisLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                stroke={chartTheme.axis}
                tick={{ fill: chartTheme.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={36}
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: "rgba(232, 234, 240, 0.04)" }}
            contentStyle={chartTooltipStyle}
            formatter={(value) => [String(value), "Eventos"]}
            labelFormatter={(name) => String(name)}
          />
          <Bar dataKey="value" fill={color} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
