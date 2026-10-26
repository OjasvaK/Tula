import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme, tooltipStyle } from "./chartTheme";

export function ActivityArea({ activity = [], height = 260 }) {
  const t = useChartTheme();
  const data = activity.map((d) => ({
    date: d.date,
    label: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    count: d.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.brand} stopOpacity={0.35} />
            <stop offset="100%" stopColor={t.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={t.grid} />
        <XAxis
          dataKey="label"
          stroke={t.axis}
          tick={{ fill: t.text, fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          stroke={t.axis}
          tick={{ fill: t.text, fontSize: 12 }}
          width={28}
        />
        <Tooltip {...tooltipStyle(t)} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={t.brand}
          strokeWidth={2}
          fill="url(#activityFill)"
          name="Listings checked"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
