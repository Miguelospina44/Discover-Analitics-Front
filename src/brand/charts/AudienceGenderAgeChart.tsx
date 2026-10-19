"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame } from "@/brand/ChartFrame";
import { chartTheme, chartTooltipStyle, genderSeriesColors } from "@/brand/chart-tokens";
import { ageBandLabel, copy, genderLabel } from "@/copy";
import { formatCount, formatSharePercent, pivotAudienceGenderAge } from "@/lib/metrics";
import type { AudienceGenderAgePoint } from "@/lib/types";

type Props = {
  points: AudienceGenderAgePoint[];
};

type TooltipItem = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, string | number>;
};

function AudienceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((item) => Number(item.value) > 0);
  if (!items.length) return null;

  return (
    <div className="rounded-md px-3 py-2.5" style={chartTooltipStyle}>
      <p className="mb-2 text-xs text-[var(--discover-cloud)]">
        {ageBandLabel(String(label ?? ""))}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const key = String(item.dataKey ?? "");
          const share = Number(item.payload?.[`${key}_share`] ?? 0);
          return (
            <li
              key={key}
              className="flex items-baseline justify-between gap-4 text-xs text-[var(--discover-pearl)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: item.color }}
                  aria-hidden
                />
                {item.name}
              </span>
              <span className="tabular-nums">
                {formatCount(Number(item.value))} · {formatSharePercent(share)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GenderLegend({ genders }: { genders: string[] }) {
  return (
    <ul
      className="mt-4 flex flex-wrap gap-x-4 gap-y-2"
      aria-label={copy.charts.genderAge.legend}
    >
      {genders.map((gender) => {
        const color = genderSeriesColors[gender] ?? chartTheme.series[3];
        return (
          <li
            key={gender}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: color }}
              aria-hidden
            />
            {genderLabel(gender)}
          </li>
        );
      })}
    </ul>
  );
}

export function AudienceGenderAgeChart({ points }: Props) {
  const { rows, genders } = pivotAudienceGenderAge(points);
  const ariaLabel = `${copy.charts.genderAge.title}. ${copy.charts.people}. ${copy.charts.genderAge.legend}: ${genders.map(genderLabel).join(", ")}.`;

  const bars = genders.map((gender) => (
    <Bar
      key={gender}
      dataKey={gender}
      name={genderLabel(gender)}
      fill={genderSeriesColors[gender] ?? chartTheme.series[3]}
      maxBarSize={28}
      isAnimationActive={false}
      radius={[4, 4, 0, 0]}
    />
  ));

  const stackedBars = genders.map((gender, index) => (
    <Bar
      key={gender}
      dataKey={gender}
      name={genderLabel(gender)}
      fill={genderSeriesColors[gender] ?? chartTheme.series[3]}
      stackId="audience"
      isAnimationActive={false}
      radius={index === genders.length - 1 ? [0, 4, 4, 0] : 0}
    />
  ));

  return (
    <>
      <table className="sr-only">
        <caption>{copy.charts.genderAge.title}</caption>
        <thead>
          <tr>
            <th>{copy.charts.genderAge.age}</th>
            {genders.map((gender) => (
              <th key={gender}>{genderLabel(gender)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.age_band}>
              <th>{ageBandLabel(String(row.age_band))}</th>
              {genders.map((gender) => (
                <td key={gender}>{formatCount(Number(row[gender] ?? 0))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ChartFrame label={ariaLabel} className="chart-frame-tall hidden min-[720px]:block">
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
            barCategoryGap="22%"
            barGap={3}
            accessibilityLayer
          >
            <CartesianGrid stroke={chartTheme.grid} vertical={false} strokeDasharray="0" />
            <XAxis
              dataKey="age_band"
              tick={{ fill: chartTheme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => ageBandLabel(value)}
            />
            <YAxis
              tick={{ fill: chartTheme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value: number) => formatCount(value)}
            />
            <Tooltip
              cursor={{ fill: "rgba(232, 234, 240, 0.04)" }}
              content={<AudienceTooltip />}
            />
            {bars}
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame label={ariaLabel} className="chart-frame-tall min-[720px]:hidden">
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            barCategoryGap="18%"
            accessibilityLayer
          >
            <CartesianGrid stroke={chartTheme.grid} horizontal={false} strokeDasharray="0" />
            <XAxis
              type="number"
              tick={{ fill: chartTheme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatCount(value)}
            />
            <YAxis
              type="category"
              dataKey="age_band"
              tick={{ fill: chartTheme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={72}
              tickFormatter={(value: string) => ageBandLabel(value)}
            />
            <Tooltip
              cursor={{ fill: "rgba(232, 234, 240, 0.04)" }}
              content={<AudienceTooltip />}
            />
            {stackedBars}
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <GenderLegend genders={genders} />
    </>
  );
}
