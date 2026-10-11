"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

interface PowerBarChartProps<T extends object> {
  data: T[];
  xKey: string;
  bars: { key: string; name: string; color: string }[];
  unit?: string;
}

export default function PowerBarChart<T extends object>({
  data,
  xKey,
  bars,
  unit = " Wh",
}: PowerBarChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
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
        <Tooltip
          content={(props) => <ChartTooltip {...props} unit={unit} />}
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
        />
        {bars.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
          />
        )}
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
