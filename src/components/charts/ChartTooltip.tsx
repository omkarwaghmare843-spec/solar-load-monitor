import { TooltipContentProps } from "recharts";

export default function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: TooltipContentProps & { unit?: string }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry, idx) => (
          <div key={`${entry.name}-${idx}`} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold text-foreground tabular-nums">
              {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
