import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme, tooltipStyle } from "./chartTheme";

export function ComplianceDonut({ compliant = 0, flagged = 0, height = 240 }) {
  const t = useChartTheme();
  const data = [
    { name: "Compliant", value: compliant, fill: t.success },
    { name: "Flagged", value: flagged, fill: t.danger },
  ];
  const total = compliant + flagged;

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">No listings yet.</p>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle(t)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-content">
          {Math.round((compliant / total) * 100)}%
        </span>
        <span className="text-xs text-muted">compliant</span>
      </div>
    </div>
  );
}
