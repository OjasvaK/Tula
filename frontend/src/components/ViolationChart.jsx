import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTrends } from "../hooks/useTrends";

export function ViolationChart() {
  const { data: trends = {}, isLoading, isError, error } = useTrends();
  const data = Object.entries(trends).map(([field, count]) => ({ field, count }));

  if (isLoading) return <p>Loading trends...</p>;
  if (isError) return <p className="error">Failed to load trends: {error.message}</p>;
  if (data.length === 0) return <p>No violations recorded yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="field" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#d9534f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
