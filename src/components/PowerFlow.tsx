import { Sun, Cpu, BatteryCharging, Lightbulb, ArrowRight } from "lucide-react";
import Card from "./Card";
import { Activity } from "lucide-react";

interface PowerFlowProps {
  solarPower: number;
  batteryVoltage: number;
  batteryCharging: boolean;
  loadPower: number;
}

function Node({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Sun;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: `${color}1a` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-[11px] text-muted">{sub}</p>
      </div>
    </div>
  );
}

export default function PowerFlow({
  solarPower,
  batteryVoltage,
  batteryCharging,
  loadPower,
}: PowerFlowProps) {
  const balance = solarPower - loadPower;
  return (
    <Card title="Live Power Flow" icon={Activity} iconColor="var(--series-1)">
      <div className="flex items-center justify-between gap-1 py-2">
        <Node
          icon={Sun}
          label="Solar Panel"
          value={`${solarPower.toFixed(1)} W`}
          sub="(Input)"
          color="var(--series-4)"
        />
        <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
        <Node
          icon={Cpu}
          label="Controller"
          value="MPPT"
          sub=""
          color="var(--series-1)"
        />
        <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
        <Node
          icon={BatteryCharging}
          label={batteryCharging ? "Charging" : "Discharging"}
          value={`${batteryVoltage.toFixed(1)} V`}
          sub="(Battery)"
          color="var(--status-good)"
        />
        <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
        <Node
          icon={Lightbulb}
          label="Load"
          value={`${loadPower.toFixed(1)} W`}
          sub="(Output)"
          color="var(--series-2)"
        />
      </div>
      <p className="mt-2 text-center text-xs font-medium text-muted">
        Power Balance:{" "}
        <span className="text-foreground">
          {balance >= 0 ? "+" : ""}
          {balance.toFixed(1)} W
        </span>{" "}
        (solar − load)
      </p>
    </Card>
  );
}
