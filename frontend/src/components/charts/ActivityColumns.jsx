import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme as t, tooltipStyle } from "./chartTheme";

function niceMax(v) {
  if (v <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil((v + 1) / step) * step;
}

/** Checks per day: square columns in the data hue, 4 faint gridlines, round ticks above the max. */
export function ActivityColumns({ activity = [], height = 200 }) {
  const data = activity.map((d) => ({
    date: d.date,
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: d.count,
  }));
  const max = niceMax(Math.max(0, ...data.map((d) => d.count)));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 4, top: 6, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={t.grid} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: t.axis, strokeWidth: 1 }}
          tick={{ fill: t.text, fontSize: 12, fontFamily: t.font }}
          interval={6}
        />
        <YAxis
          allowDecimals={false}
          domain={[0, max]}
          tickCount={5}
          tickLine={false}
          axisLine={false}
          tick={{ fill: t.text, fontSize: 12, fontFamily: t.font }}
          width={28}
        />
        <Tooltip {...tooltipStyle} cursor={{ fill: t.grid, opacity: 0.6 }} formatter={(v) => [v, "Labels checked"]} />
        <Bar dataKey="count" fill={t.data} radius={[2, 2, 0, 0]} maxBarSize={18} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
