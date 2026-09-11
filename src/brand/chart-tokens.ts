/**
 * Discover chart / viz tokens — light canvas, low saturation.
 * Brand yellow #F3F188 kept for accents; chart series 1 uses a readable olive of the same hue family for contrast on white (still not a Material gold).
 */
export const discoverColors = {
  obsidian: "#000000",
  yellow: "#F3F188",
  ultraviolet: "#A894C9",
  tomato: "#C45A45",
  cornflower: "#7A9BC4",
  plum: "#C9A8C8",
  paper: "#FFFFFF",
  mist: "#F7F7F4",
  fog: "#EFEEE8",
  line: "#E4E2DA",
  storm: "#6B6D78",
  ink: "#121212",
  /** Readable chart primary derived from brand yellow hue */
  chartYellow: "#C9C65A",
} as const;

export const chartSeries = [
  discoverColors.chartYellow,
  discoverColors.ultraviolet,
  discoverColors.cornflower,
  discoverColors.plum,
] as const;

export const chartAlert = discoverColors.tomato;

export const chartTheme = {
  background: "transparent",
  grid: "rgba(18, 18, 18, 0.08)",
  axis: discoverColors.storm,
  tooltipBg: "rgba(255, 255, 255, 0.92)",
  tooltipBorder: discoverColors.line,
  tooltipText: discoverColors.ink,
  series: [...chartSeries],
  alert: chartAlert,
  positive: discoverColors.chartYellow,
  negative: discoverColors.tomato,
} as const;

export type DiscoverColorKey = keyof typeof discoverColors;
