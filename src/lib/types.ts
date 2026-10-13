export interface SensorReading {
  voltage: number;
  current: number;
  power: number;
}

export interface Faults {
  panel: boolean;
  battery: boolean;
  load: boolean;
  controller: boolean;
}

export interface LiveData {
  solar: SensorReading;
  load: SensorReading;
  battery: {
    voltage: number;
    percent: number;
  };
  faults: Faults;
  efficiency: number;
  powerLoss: number;
  timestamp: number;
}

export interface HistoryEntry extends LiveData {
  id: string;
}

export interface ControlState {
  relay1: boolean; // LED — desired state, set by the dashboard
  relay2: boolean; // FAN — desired state, set by the dashboard
  relay1_state?: boolean; // confirmed actual state, written back by the ESP8266
  relay2_state?: boolean;
}

export function emptyControlState(): ControlState {
  return { relay1: false, relay2: false };
}

export const THRESHOLDS = {
  batteryLowVoltage: 9.6,
  batteryFullVoltage: 12.6,
  batteryMinVoltage: 9.0,
  loadMaxCurrent: 1.0,
  solarLowPower: 0.5,
} as const;

export function emptyReading(): SensorReading {
  return { voltage: 0, current: 0, power: 0 };
}

export function emptyLiveData(): LiveData {
  return {
    solar: emptyReading(),
    load: emptyReading(),
    battery: { voltage: 0, percent: 0 },
    faults: { panel: false, battery: false, load: false, controller: false },
    efficiency: 0,
    powerLoss: 0,
    timestamp: 0,
  };
}
