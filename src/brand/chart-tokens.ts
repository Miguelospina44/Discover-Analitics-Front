/**
 * Discover chart / viz tokens — same HEX as `src/app/tokens.css`.
 * Champagne as primary series; complementary tones for additional venues.
 */
export const discoverColors = {
  obsidian: "#0F1419",
  champagne: "#C9A86D",
  slateBlue: "#6B8CAE",
  terracotta: "#C67B6B",
  sage: "#7FA885",
  mauve: "#9B869B",
  night: "#0F1419",
  graphite: "#161A20",
  steel: "#1E232C",
  slate: "#2A303A",
  fog: "#6D7484",
  cloud: "#B4BBC8",
  pearl: "#E8EAF0",
  white: "#FFFFFF",
  chartPrimary: "#C9A86D",
} as const;

export const chartSeries = [
  discoverColors.champagne,
  discoverColors.slateBlue,
  discoverColors.sage,
  discoverColors.mauve,
] as const;

export const chartAlert = discoverColors.terracotta;

export const chartTheme = {
  background: "transparent",
  grid: "rgba(232, 234, 240, 0.06)",
  axis: discoverColors.cloud,
  tooltipBg: discoverColors.steel,
  tooltipBorder: "transparent",
  tooltipText: discoverColors.pearl,
  series: [...chartSeries],
  alert: chartAlert,
  positive: discoverColors.sage,
  negative: discoverColors.terracotta,
} as const;

export const chartTooltipStyle = {
  borderRadius: 8,
  border: "0",
  background: chartTheme.tooltipBg,
  color: chartTheme.tooltipText,
  fontSize: 12,
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
} as const;

export const genderSeriesColors: Record<string, string> = {
  woman: discoverColors.champagne,
  man: discoverColors.slateBlue,
  other: discoverColors.sage,
  undisclosed: discoverColors.mauve,
};

export type DiscoverColorKey = keyof typeof discoverColors;
