/** Recharts cannot read CSS custom properties, so it gets the tokens as values. */
export const chartTheme = {
  grid: "#e2e7eb",
  axis: "#5b6778",
  text: "#475468",
  ink: "#15233c",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e7eb",
  data: "#1f56a3",
  negative: "#b0173f",
  font: "Mukta, system-ui, sans-serif",
};

export const tooltipStyle = {
  contentStyle: {
    background: chartTheme.tooltipBg,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: 4,
    fontSize: 13,
    fontFamily: chartTheme.font,
    color: chartTheme.ink,
    boxShadow: "0 4px 14px rgba(21, 35, 60, 0.10)",
  },
  labelStyle: { color: chartTheme.ink, fontWeight: 600 },
  itemStyle: { color: chartTheme.ink },
};
