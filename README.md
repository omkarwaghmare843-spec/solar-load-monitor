# Renewable Energy Monitoring System

A live dashboard for a solar + battery + load monitoring rig built on an
**ESP8266** with two **INA219** current/voltage sensors (solar input at
`0x44`, load output at `0x40`) and a 2-channel relay module for switching a
LED and a fan. The ESP8266 pushes readings to **Firebase Realtime
Database** and listens for relay commands from it; this Next.js app reads
live data, renders charts/history, and lets you toggle the relays.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Firebase (Realtime Database + Authentication)
- Recharts for live & historical charts
- Deployed on Vercel
- ESP8266 firmware in [`firmware/`](firmware/) (Arduino, FirebaseESP8266 + Adafruit INA219)

## Firebase setup

1. In the Firebase console, enable **Realtime Database** and **Authentication
   → Email/Password**.
2. Create at least one user under Authentication → Users (this is the login
   used for the dashboard).
3. Deploy the included security rules (`database.rules.json`) via the
   Firebase console's Realtime Database → Rules tab, or the CLI:
   ```bash
   firebase deploy --only database
   ```
4. Grab your Web App config (Project settings → General → Your apps → Web
   app) and fill in `.env.local` (copy from `.env.local.example`):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```
5. Grab the **Database Secret** (Project settings → Service accounts →
   Database secrets) for the ESP8266 firmware — see [`firmware/README.md`](firmware/README.md).
   This is a server-side credential; it only ever goes into the firmware
   sketch, never into `.env.local` or anything shipped to the browser.

## Realtime Database shape

The ESP8266 firmware (see [`firmware/`](firmware/)) reads both INA219s,
computes battery %, efficiency, power loss and fault flags, and writes:

```
/live
  solar:   { voltage, current, power }
  load:    { voltage, current, power }
  battery: { voltage, percent }
  faults:  { panel, battery, load, controller }   // booleans
  efficiency: number   // load power / solar power * 100
  powerLoss:  number   // solar power - load power
  timestamp:  number   // epoch millis (NTP-synced on the ESP8266)

/history/{pushId}
  // same shape as /live, appended once a minute

/control
  relay1:       bool   // LED  — desired state, set by the web app
  relay2:       bool   // FAN  — desired state, set by the web app
  relay1_state: bool   // confirmed actual state, written back by the ESP8266
  relay2_state: bool
```

This mirrors the flow in `docs/flow-diagram.jpeg`: read both INA219 sensors,
compute power/efficiency/faults against the thresholds below, then log —
plus the relay control loop added for the LED/fan.

**Thresholds** (set in the ESP8266 sketch, shown read-only in Settings):

| Threshold | Value |
|---|---|
| Battery Low Voltage | 9.6 V |
| Battery Full Voltage | 12.6 V |
| Battery Min Voltage | 9.0 V |
| Load Max Current | 1.0 A |
| Solar Low Power | 0.5 W |

Battery % is estimated as `(V - 9.0) / (12.6 - 9.0) * 100`.

## Hardware

- **Solar INA219** — I2C address `0x44` (A0 pad shorted to VS+)
- **Load INA219** — I2C address `0x40` (default, unshorted)
- **2-channel relay module** (active-LOW) — IN1 → D5 (LED), IN2 → D6 (Fan)

Full wiring table and firmware setup: [`firmware/README.md`](firmware/README.md).

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in your Firebase config
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
`/login` — sign in with a user created in Firebase Authentication.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same `NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel
   project settings (Settings → Environment Variables).
4. Deploy. Vercel auto-detects Next.js — no extra build config needed.

## Pages

- **Dashboard** (`/`) — stat cards, live power flow, fault alerts, 7-day charts.
- **Live Monitoring** (`/live`) — raw sensor readings per INA219 + rolling live charts.
- **Historical Data** (`/history`) — date-range filterable charts, daily log table, CSV export.
- **Load Control** (`/load-control`) — toggle the LED and fan relays, with live confirmation from the ESP8266.
- **Settings** (`/settings`) — account info and firmware thresholds (read-only).
