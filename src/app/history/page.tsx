"use client";

import { useMemo, useState } from "react";
import { History as HistoryIcon, Download } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import PowerBarChart from "@/components/charts/PowerBarChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import { useHistoryData } from "@/hooks/useHistoryData";
import { aggregateByDay } from "@/lib/aggregate";

const RANGE_OPTIONS = [
  { label: "7 days", points: 7 },
  { label: "14 days", points: 14 },
  { label: "30 days", points: 30 },
];

function toCsv(rows: ReturnType<typeof aggregateByDay>): string {
  const header = "Date,Solar Gen (Wh),Load Cons (Wh),Avg Battery (V),Efficiency (%)";
  const lines = rows.map(
    (r) => `${r.date},${r.solarWh},${r.loadWh},${r.avgBatteryVoltage},${r.avgEfficiency}`
  );
  return [header, ...lines].join("\n");
}

export default function HistoryPage() {
  const { history, loading } = useHistoryData(5000);
  const [rangeIdx, setRangeIdx] = useState(0);

  const daily = useMemo(() => aggregateByDay(history), [history]);
  const visible = daily.slice(-RANGE_OPTIONS[rangeIdx].points);

  function handleExport() {
    const csv = toCsv(visible);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `energy-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title="Historical Data"
          subtitle="Daily solar, load, and battery performance"
          connected={!loading}
        />
        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
              {RANGE_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.label}
                  onClick={() => setRangeIdx(idx)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    idx === rangeIdx
                      ? "bg-navy text-white"
                      : "text-muted hover:bg-background"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={visible.length === 0}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {!loading && history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
              No historical data yet. Once your ESP32 starts writing to{" "}
              <code className="rounded bg-background px-1 py-0.5">/history</code> in Firebase,
              records will appear here.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card title="Generation vs Consumption">
                  <PowerBarChart
                    data={visible}
                    xKey="date"
                    bars={[
                      { key: "solarWh", name: "Generation", color: "var(--series-4)" },
                      { key: "loadWh", name: "Consumption", color: "var(--series-1)" },
                    ]}
                  />
                </Card>
                <Card title="Efficiency Trend">
                  <TrendLineChart
                    data={visible}
                    xKey="date"
                    lines={[{ key: "avgEfficiency", name: "Efficiency", color: "var(--series-3)" }]}
                    unit="%"
                  />
                </Card>
              </div>

              <Card title="Daily Log" icon={HistoryIcon} iconColor="var(--series-1)">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Solar Gen. (Wh)</th>
                        <th className="py-2 pr-4">Load Cons. (Wh)</th>
                        <th className="py-2 pr-4">Avg Battery (V)</th>
                        <th className="py-2 pr-4">Efficiency (%)</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {[...visible].reverse().map((row) => (
                        <tr key={row.date} className="border-b border-border last:border-0">
                          <td className="py-2 pr-4 font-medium text-foreground">{row.date}</td>
                          <td className="py-2 pr-4 text-muted">{row.solarWh}</td>
                          <td className="py-2 pr-4 text-muted">{row.loadWh}</td>
                          <td className="py-2 pr-4 text-muted">{row.avgBatteryVoltage}</td>
                          <td className="py-2 pr-4 text-muted">{row.avgEfficiency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </main>
      </AppShell>
    </AuthGuard>
  );
}
