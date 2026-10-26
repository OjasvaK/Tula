import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fieldLabel } from "../../lib/format";
import { useChartTheme, tooltipStyle } from "./chartTheme";

export function ViolationBarChart({ trends = {}, rules = [], height = 300 }) {
  const t = useChartTheme();
  const refByField = Object.fromEntries(
    rules.map((r) => [r.field, r.legal_reference])
  );
  const total = Object.values(trends).reduce((a, b) => a + b, 0);

  const data = Object.entries(trends)
    .map(([field, count]) => ({
      field,
      label: fieldLabel(field),
      count,
      reference: refByField[field] || "",
      share: total ? count / total : 0,
    }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        No violations recorded yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke={t.grid} />
        <XAxis
          type="number"
          allowDecimals={false}
          stroke={t.axis}
          tick={{ fill: t.text, fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          stroke={t.axis}
          tick={{ fill: t.text, fontSize: 12 }}
        />
        <Tooltip
          {...tooltipStyle(t)}
          formatter={(value, _n, entry) => [
            `${value} listing${value === 1 ? "" : "s"} (${(entry.payload.share * 100).toFixed(0)}%)`,
            "Missing",
          ]}
          labelFormatter={(label, payload) => {
            const ref = payload && payload[0] && payload[0].payload.reference;
            return ref ? `${label} — ${ref}` : label;
          }}
          cursor={{ fill: t.grid, opacity: 0.4 }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((entry, i) => (
            <Cell key={entry.field} fill={t.series[i % t.series.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
