import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sublabel?: string;
  footer?: string;
  tint?: string;
}

export default function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sublabel,
  footer,
  tint,
}: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4 shadow-sm"
      style={{ background: tint ?? "var(--surface)" }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: iconBg }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
          {value}
        </p>
        {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
      </div>
      {footer && (
        <p className="text-xs font-medium text-muted">{footer}</p>
      )}
    </div>
  );
}
