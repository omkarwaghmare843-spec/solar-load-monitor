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
    <div className="flex flex-1 basis-1/2 flex-col items-center gap-2 text-center sm:basis-auto">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
        style={{ background: `${color}1a` }}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
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
      <div className="flex flex-wrap items-start justify-center gap-y-4 py-2 sm:flex-nowrap sm:items-center sm:justify-between sm:gap-1">
        <Node
          icon={Sun}
          label="Solar Panel"
          value={`${solarPower.toFixed(1)} W`}
          sub="(Input)"
          color="var(--series-4)"
        />
        <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted sm:block" />
        <Node
          icon={Cpu}
          label="Controller"
          value="MPPT"
          sub=""
          color="var(--series-1)"
        />
        <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted sm:block" />
        <Node
          icon={BatteryCharging}
          label={batteryCharging ? "Charging" : "Discharging"}
          value={`${batteryVoltage.toFixed(1)} V`}
          sub="(Battery)"
          color="var(--status-good)"
        />
        <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted sm:block" />
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
