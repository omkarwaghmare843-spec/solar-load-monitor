"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

interface TrendLineChartProps<T extends object> {
  data: T[];
  xKey: string;
  lines: { key: string; name: string; color: string }[];
  unit?: string;
}

export default function TrendLineChart<T extends object>({
  data,
  xKey,
  lines,
  unit = "",
}: TrendLineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--chart-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={(props) => <ChartTooltip {...props} unit={unit} />} />
        {lines.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 3, fill: line.color, strokeWidth: 2, stroke: "var(--surface)" }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface)" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
