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

const PALETTE = ["#111111", "#F3F188", "#6B7280", "#374151", "#9CA3AF"];

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
      style={{ width: "100%", height: 280 }}
      onMouseDown={hushFocus}
    >
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(17,17,17,0.06)" vertical={false} />
          <XAxis
            dataKey="night_date"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(17,17,17,0.08)",
              background: "rgba(255,255,255,0.95)",
            }}
          />
          <Legend
            wrapperStyle={{ cursor: onToggleVenue ? "pointer" : undefined }}
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
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2.5}
                strokeOpacity={dimmed ? 0.28 : 1}
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
