# Renewable Energy Monitoring System

A live dashboard for a solar + battery + load monitoring rig built on an
**ESP32** with two **INA219** current/voltage sensors (solar input at `0x40`,
load output at `0x41`). The ESP32 pushes readings to **Firebase Realtime
Database**; this Next.js app reads them live and renders a dashboard with
live monitoring, charts, and historical data.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Firebase (Realtime Database + Authentication)
- Recharts for live & historical charts
- Deployed on Vercel

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

## Expected Realtime Database shape

The ESP32 firmware should write to two locations:

```
/live
  solar:   { voltage, current, power }
  load:    { voltage, current, power }
  battery: { voltage, percent }
  faults:  { panel, battery, load, controller }   // booleans
  efficiency: number   // load power / solar power * 100
  powerLoss:  number   // solar power - load power
  timestamp:  number   // epoch millis

/history/{pushId}
  // same shape as /live, one snapshot per logging interval (e.g. every 2s or batched)
```

This mirrors the flow in `docs/flow-diagram.jpeg`: read both INA219 sensors,
compute power/efficiency/faults against the thresholds below, then log.

**Thresholds** (set in the ESP32 sketch, shown read-only in Settings):

| Threshold | Value |
|---|---|
| Battery Low Voltage | 9.6 V |
| Battery Full Voltage | 12.6 V |
| Battery Min Voltage | 9.0 V |
| Load Max Current | 1.0 A |
| Solar Low Power | 0.5 W |

Battery % is estimated as `(V - 9.0) / (12.6 - 9.0) * 100`.

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
- **Settings** (`/settings`) — account info and firmware thresholds (read-only).
