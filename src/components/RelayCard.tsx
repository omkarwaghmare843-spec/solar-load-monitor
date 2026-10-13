import { LucideIcon } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

interface RelayCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  description: string;
  desired: boolean;
  confirmed?: boolean;
  onToggle: (next: boolean) => void;
  pending: boolean;
}

export default function RelayCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  description,
  desired,
  confirmed,
  onToggle,
  pending,
}: RelayCardProps) {
  const inSync = confirmed === undefined || confirmed === desired;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: iconBg }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted">{description}</p>
          <p
            className="mt-1 text-xs font-medium"
            style={{
              color: inSync
                ? desired
                  ? "var(--status-good)"
                  : "var(--chart-muted)"
                : "var(--status-warning)",
            }}
          >
            {pending
              ? "Sending..."
              : inSync
              ? desired
                ? "ON"
                : "OFF"
              : "Syncing with device..."}
          </p>
        </div>
      </div>
      <ToggleSwitch checked={desired} onChange={onToggle} disabled={pending} label={label} />
    </div>
  );
}
