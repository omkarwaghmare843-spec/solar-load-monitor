"use client";

import { useEffect, useState } from "react";
import { Sun, Plug, BatteryCharging } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import FaultAlerts from "@/components/FaultAlerts";
import TrendLineChart from "@/components/charts/TrendLineChart";
import { useLiveData } from "@/hooks/useLiveData";
import { formatTime } from "@/lib/aggregate";

const MAX_POINTS = 40;

function ReadingRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {value.toFixed(2)} {unit}
      </span>
    </div>
  );
}

export default function LiveMonitoringPage() {
  const { data, connected } = useLiveData();
  const [series, setSeries] = useState<Array<Record<string, number | string>>>([]);

  useEffect(() => {
    if (!connected) return;
    setSeries((prev) => {
      const next = [
        ...prev,
        {
          time: formatTime(data.timestamp || Date.now()),
          solarPower: Number(data.solar.power.toFixed(2)),
          loadPower: Number(data.load.power.toFixed(2)),
          batteryVoltage: Number(data.battery.voltage.toFixed(2)),
        },
      ];
      return next.slice(-MAX_POINTS);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, [data.timestamp]);

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title="Live Monitoring"
          subtitle="Real-time sensor readings from ESP32 + 2×INA219"
          connected={connected}
        />
        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Solar (0x40)" icon={Sun} iconColor="var(--series-4)">
              <ReadingRow label="Bus Voltage" value={data.solar.voltage} unit="V" />
              <ReadingRow label="Current" value={data.solar.current} unit="A" />
              <ReadingRow label="Power" value={data.solar.power} unit="W" />
            </Card>
            <Card title="Load (0x41)" icon={Plug} iconColor="var(--series-1)">
              <ReadingRow label="Bus Voltage" value={data.load.voltage} unit="V" />
              <ReadingRow label="Current" value={data.load.current} unit="A" />
              <ReadingRow label="Power" value={data.load.power} unit="W" />
            </Card>
            <Card title="Battery / System" icon={BatteryCharging} iconColor="var(--status-good)">
              <ReadingRow label="Voltage" value={data.battery.voltage} unit="V" />
              <ReadingRow label="Estimated SOC" value={data.battery.percent} unit="%" />
              <ReadingRow label="Efficiency" value={data.efficiency} unit="%" />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Solar vs Load Power (live)" icon={Sun} iconColor="var(--series-4)">
              <TrendLineChart
                data={series}
                xKey="time"
                lines={[
                  { key: "solarPower", name: "Solar Power", color: "var(--series-4)" },
                  { key: "loadPower", name: "Load Power", color: "var(--series-1)" },
                ]}
                unit=" W"
              />
            </Card>
            <Card title="Battery Voltage (live)" icon={BatteryCharging} iconColor="var(--status-good)">
              <TrendLineChart
                data={series}
                xKey="time"
                lines={[{ key: "batteryVoltage", name: "Battery Voltage", color: "var(--status-good)" }]}
                unit=" V"
              />
            </Card>
          </div>

          <FaultAlerts faults={data.faults} />
        </main>
      </AppShell>
    </AuthGuard>
  );
}
