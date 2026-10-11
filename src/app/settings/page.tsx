"use client";

import { Settings as SettingsIcon, Sliders, User } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth-context";
import { THRESHOLDS } from "@/lib/types";

const THRESHOLD_ROWS = [
  { label: "Battery Low Voltage", value: `${THRESHOLDS.batteryLowVoltage.toFixed(1)} V` },
  { label: "Battery Full Voltage", value: `${THRESHOLDS.batteryFullVoltage.toFixed(1)} V` },
  { label: "Battery Min Voltage", value: `${THRESHOLDS.batteryMinVoltage.toFixed(1)} V` },
  { label: "Load Max Current", value: `${THRESHOLDS.loadMaxCurrent.toFixed(1)} A` },
  { label: "Solar Low Power", value: `${THRESHOLDS.solarLowPower.toFixed(1)} W` },
];

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title="Settings"
          subtitle="System thresholds and account details"
          connected={true}
        />
        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          <Card title="Account" icon={User} iconColor="var(--series-1)">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted">Signed in as</span>
              <span className="font-medium text-foreground">{user?.email}</span>
            </div>
          </Card>

          <Card title="Alert Thresholds" icon={Sliders} iconColor="var(--accent-purple)">
            <p className="mb-3 text-xs text-muted">
              These match the limits configured in the ESP32 firmware. Update the firmware
              sketch to change them — this view is read-only.
            </p>
            <ul className="divide-y divide-border">
              {THRESHOLD_ROWS.map((row) => (
                <li key={row.label} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-foreground">{row.label}</span>
                  <span className="font-semibold text-foreground tabular-nums">{row.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="About" icon={SettingsIcon} iconColor="var(--chart-muted)">
            <p className="text-sm text-muted">
              Renewable Energy Monitoring System — ESP32 + 2×INA219, streaming live
              readings to Firebase Realtime Database. Battery % is estimated from
              voltage, not true state of charge.
            </p>
          </Card>
        </main>
      </AppShell>
    </AuthGuard>
  );
}
