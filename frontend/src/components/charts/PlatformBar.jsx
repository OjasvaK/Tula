import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme, tooltipStyle } from "./chartTheme";

export function PlatformBar({ platforms = [], height = 280 }) {
  const t = useChartTheme();
  const data = platforms.map((p) => ({
    platform: p.platform,
    Compliant: p.total - p.flagged,
    Flagged: p.flagged,
  }));

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        No platform data yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke={t.grid} />
        <XAxis
          dataKey="platform"
          stroke={t.axis}
          tick={{ fill: t.text, fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          stroke={t.axis}
          tick={{ fill: t.text, fontSize: 12 }}
        />
        <Tooltip {...tooltipStyle(t)} cursor={{ fill: t.grid, opacity: 0.4 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: t.text }} />
        <Bar dataKey="Compliant" stackId="a" fill={t.success} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Flagged" stackId="a" fill={t.danger} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
