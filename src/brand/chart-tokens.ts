/**
 * Discover chart / viz tokens — premium dark canvas, professional palette.
 * Champagne #C9A86D as primary accent; muted complementary tones for series.
 */
export const discoverColors = {
  obsidian: "#0F1419",
  champagne: "#C9A86D",
  slateBlue: "#6B8CAE",
  terracotta: "#C67B6B",
  sage: "#7FA885",
  mauve: "#9B869B",
  night: "#0F1419",
  graphite: "#1A1D23",
  steel: "#252932",
  slate: "#3A3F4B",
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
  grid: "rgba(232, 234, 240, 0.1)",
  axis: discoverColors.cloud,
  tooltipBg: "rgba(37, 41, 50, 0.96)",
  tooltipBorder: discoverColors.slate,
  tooltipText: discoverColors.pearl,
  series: [...chartSeries],
  alert: chartAlert,
  positive: discoverColors.sage,
  negative: discoverColors.terracotta,
} as const;

export const chartTooltipStyle = {
  borderRadius: 10,
  border: `1px solid ${chartTheme.tooltipBorder}`,
  background: chartTheme.tooltipBg,
  color: chartTheme.tooltipText,
  fontSize: 12,
  boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
} as const;

export const genderSeriesColors: Record<string, string> = {
  woman: discoverColors.champagne,
  man: discoverColors.slateBlue,
  other: discoverColors.sage,
  undisclosed: discoverColors.mauve,
};

export type DiscoverColorKey = keyof typeof discoverColors;
