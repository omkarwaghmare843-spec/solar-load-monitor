"use client";

import { Sun, Plug, BatteryCharging, Zap, BarChart3 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import PowerFlow from "@/components/PowerFlow";
import FaultAlerts from "@/components/FaultAlerts";
import PowerBarChart from "@/components/charts/PowerBarChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import { useLiveData } from "@/hooks/useLiveData";
import { useHistoryData } from "@/hooks/useHistoryData";
import { aggregateByDay } from "@/lib/aggregate";

export default function DashboardPage() {
  const { data, connected } = useLiveData();
  const { history } = useHistoryData(2000);
  const daily = aggregateByDay(history).slice(-7);

  const todaySolarWh = daily.at(-1)?.solarWh ?? 0;
  const todayLoadWh = daily.at(-1)?.loadWh ?? 0;
  const batteryEnergyWh = (data.battery.percent / 100) * 33.3;

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title="Renewable Energy Monitoring System"
          subtitle="Solar Microgrid | Live Data & Performance"
          connected={connected}
        />
        <main className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={Sun}
              iconColor="var(--series-4)"
              iconBg="rgba(237,161,0,0.15)"
              label="Solar Generation"
              value={`${data.solar.power.toFixed(1)} W`}
              sublabel="(Today)"
              footer={`Total: ${todaySolarWh.toFixed(1)} Wh`}
            />
            <StatCard
              icon={Plug}
              iconColor="var(--series-1)"
              iconBg="rgba(42,120,214,0.15)"
              label="Load Consumption"
              value={`${data.load.power.toFixed(1)} W`}
              sublabel="(Today)"
              footer={`Total: ${todayLoadWh.toFixed(1)} Wh`}
            />
            <StatCard
              icon={BatteryCharging}
              iconColor="var(--status-good)"
              iconBg="rgba(12,163,12,0.12)"
              label="Battery Status"
              value={`${data.battery.voltage.toFixed(1)} V`}
              sublabel={`(SOC ${data.battery.percent.toFixed(0)}%)`}
              footer={`Stored: ${batteryEnergyWh.toFixed(1)} Wh`}
              tint="var(--success-bg)"
            />
            <StatCard
              icon={Zap}
              iconColor="var(--accent-purple)"
              iconBg="rgba(124,58,237,0.12)"
              label="Power Loss"
              value={`${data.powerLoss.toFixed(1)} W`}
              sublabel="(Today)"
            />
            <StatCard
              icon={BarChart3}
              iconColor="var(--series-3)"
              iconBg="rgba(27,175,122,0.15)"
              label="Efficiency"
              value={`${data.efficiency.toFixed(1)} %`}
              sublabel="(Current)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <PowerFlow
              solarPower={data.solar.power}
              batteryVoltage={data.battery.voltage}
              batteryCharging={data.solar.power > data.load.power}
              loadPower={data.load.power}
            />
            <FaultAlerts faults={data.faults} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Solar Generation (Last 7 Days)" icon={Sun} iconColor="var(--series-4)">
              <PowerBarChart
                data={daily}
                xKey="date"
                bars={[{ key: "solarWh", name: "Solar Generation", color: "var(--series-4)" }]}
              />
            </Card>
            <Card title="Load Consumption (Last 7 Days)" icon={Plug} iconColor="var(--series-1)">
              <PowerBarChart
                data={daily}
                xKey="date"
                bars={[{ key: "loadWh", name: "Load Consumption", color: "var(--series-1)" }]}
              />
            </Card>
            <Card title="Battery SOC Trend" icon={BatteryCharging} iconColor="var(--status-good)">
              <TrendLineChart
                data={daily}
                xKey="date"
                lines={[{ key: "avgBatteryPercent", name: "SOC %", color: "var(--status-good)" }]}
                unit="%"
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Efficiency Trend" icon={BarChart3} iconColor="var(--series-3)">
              <TrendLineChart
                data={daily}
                xKey="date"
                lines={[{ key: "avgEfficiency", name: "Efficiency", color: "var(--series-3)" }]}
                unit="%"
              />
            </Card>
            <Card title="Generation vs Consumption" icon={Zap} iconColor="var(--accent-purple)">
              <PowerBarChart
                data={daily}
                xKey="date"
                bars={[
                  { key: "solarWh", name: "Generation", color: "var(--series-4)" },
                  { key: "loadWh", name: "Consumption", color: "var(--series-1)" },
                ]}
              />
            </Card>
          </div>

          <p className="pt-2 text-center text-xs text-muted">
            Clean Energy, Better Tomorrow — Monitor your renewable energy system in
            real-time and track historical performance for a sustainable future.
          </p>
        </main>
      </AppShell>
    </AuthGuard>
  );
}
