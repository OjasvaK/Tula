import { useTheme } from "../../context/ThemeContext";

/** Recharts can't read CSS custom properties, so hand it concrete colours
 *  keyed off the current theme. */
export function useChartTheme() {
  const { isDark } = useTheme();
  return isDark
    ? {
        grid: "#262b38",
        axis: "#848ca0",
        text: "#adb3c6",
        tooltipBg: "#14171f",
        tooltipBorder: "#262b38",
        brand: "#818cf8",
        danger: "#f87171",
        success: "#34d399",
        warning: "#fbbf24",
        series: ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#38bdf8", "#c084fc"],
      }
    : {
        grid: "#e3e5ee",
        axis: "#6c7387",
        text: "#4f5567",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e3e5ee",
        brand: "#4f46e5",
        danger: "#dc2626",
        success: "#16a34a",
        warning: "#d97706",
        series: ["#4f46e5", "#16a34a", "#d97706", "#dc2626", "#0284c7", "#9333ea"],
      };
}

export function tooltipStyle(t) {
  return {
    contentStyle: {
      background: t.tooltipBg,
      border: `1px solid ${t.tooltipBorder}`,
      borderRadius: 12,
      fontSize: 12,
      color: t.text,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    },
    labelStyle: { color: t.text, fontWeight: 600 },
    itemStyle: { color: t.text },
  };
}
