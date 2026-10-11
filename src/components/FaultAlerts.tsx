import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import Card from "./Card";
import { Faults } from "@/lib/types";

const FAULT_LABELS: { key: keyof Faults; label: string }[] = [
  { key: "panel", label: "Panel Fault" },
  { key: "battery", label: "Battery Fault" },
  { key: "load", label: "Load Fault" },
  { key: "controller", label: "Controller Fault" },
];

export default function FaultAlerts({ faults }: { faults: Faults }) {
  const activeCount = Object.values(faults).filter(Boolean).length;
  const allNormal = activeCount === 0;

  return (
    <Card
      title="Fault Alerts"
      icon={Bell}
      iconColor="var(--status-critical)"
      action={
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold text-white"
          style={{
            background: allNormal ? "var(--chart-muted)" : "var(--status-critical)",
          }}
        >
          {activeCount}
        </span>
      }
    >
      <ul className="divide-y divide-border">
        {FAULT_LABELS.map(({ key, label }) => {
          const active = faults[key];
          return (
            <li key={key} className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground">{label}</span>
              <span
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: active ? "var(--status-critical)" : "var(--status-good)" }}
              >
                {active ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {active ? "Fault detected" : "No fault"}
              </span>
            </li>
          );
        })}
      </ul>
      <div
        className="mt-3 rounded-lg px-3 py-2 text-center text-xs font-medium"
        style={{
          background: allNormal ? "var(--success-bg)" : "var(--danger-bg)",
          color: allNormal ? "var(--success-fg)" : "var(--danger-fg)",
        }}
      >
        {allNormal ? "All Systems Normal" : "Check Required"}
      </div>
    </Card>
  );
}
