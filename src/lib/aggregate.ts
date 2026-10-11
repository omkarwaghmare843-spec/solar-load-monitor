import { HistoryEntry } from "./types";

export interface DailySummary {
  date: string;
  solarWh: number;
  loadWh: number;
  avgEfficiency: number;
  avgBatteryVoltage: number;
  avgBatteryPercent: number;
}

const INTERVAL_HOURS = 2 / 3600;

export function aggregateByDay(history: HistoryEntry[]): DailySummary[] {
  const buckets = new Map<
    string,
    { solarWh: number; loadWh: number; effSum: number; vSum: number; pctSum: number; count: number }
  >();

  for (const entry of history) {
    const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    const bucket = buckets.get(date) ?? {
      solarWh: 0,
      loadWh: 0,
      effSum: 0,
      vSum: 0,
      pctSum: 0,
      count: 0,
    };
    bucket.solarWh += entry.solar.power * INTERVAL_HOURS;
    bucket.loadWh += entry.load.power * INTERVAL_HOURS;
    bucket.effSum += entry.efficiency;
    bucket.vSum += entry.battery.voltage;
    bucket.pctSum += entry.battery.percent;
    bucket.count += 1;
    buckets.set(date, bucket);
  }

  return Array.from(buckets.entries()).map(([date, b]) => ({
    date,
    solarWh: Number(b.solarWh.toFixed(1)),
    loadWh: Number(b.loadWh.toFixed(1)),
    avgEfficiency: Number((b.effSum / b.count).toFixed(1)),
    avgBatteryVoltage: Number((b.vSum / b.count).toFixed(2)),
    avgBatteryPercent: Number((b.pctSum / b.count).toFixed(0)),
  }));
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
