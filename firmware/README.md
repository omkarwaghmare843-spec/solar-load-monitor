# ESP8266 Firmware

Arduino sketch for the ESP8266 that reads both INA219 sensors, publishes to
Firebase Realtime Database, and drives the 2-channel relay module from
dashboard commands.

## Wiring

| Signal | ESP8266 pin |
|---|---|
| I2C SDA (both INA219s, shared) | D2 (GPIO4) |
| I2C SCL (both INA219s, shared) | D1 (GPIO5) |
| Relay IN1 (LED) | D5 (GPIO14) |
| Relay IN2 (FAN) | D6 (GPIO12) |

**INA219 addresses:**
- Solar INA219 — **A0 pad shorted to VS+** → address `0x44`
- Load INA219 — unshorted → default address `0x40`

**Relay module:** active-LOW (most common 2-channel 5V relay boards) — the
sketch already accounts for this via `RELAY_ACTIVE_LOW`. If your relays turn
on on boot or operate backwards, flip that constant to `false`.

## Arduino IDE setup

1. Install the **ESP8266 board package** (Boards Manager → search "esp8266").
2. Install libraries (Library Manager):
   - `FirebaseESP8266` by mobizt
   - `Adafruit INA219`
   - `Adafruit BusIO` (installed automatically as a dependency)
3. Open `esp8266_energy_monitor/esp8266_energy_monitor.ino`.
4. Fill in the top of the file:
   ```cpp
   #define WIFI_SSID        "YOUR_WIFI_SSID"
   #define WIFI_PASSWORD    "YOUR_WIFI_PASSWORD"
   #define FIREBASE_HOST    "load-monitor-51924-default-rtdb.firebaseio.com"
   #define FIREBASE_AUTH    "YOUR_FIREBASE_DATABASE_SECRET"
   ```
   The **Database Secret** is found in Firebase console → Project settings →
   Service accounts → Database secrets (legacy). This is a server-side
   credential — it lives only in this firmware, never in the web app's
   `.env` files.
5. Select your board (NodeMCU 1.0 / Wemos D1 mini / etc.), select the port,
   and upload.

## Data flow

- Every 2 seconds: reads both INA219s, computes battery %, efficiency, power
  loss, and fault flags, and writes a full snapshot to `/live`.
- Every 60 seconds: pushes the same snapshot to `/history/{auto-id}` for the
  dashboard's historical charts.
- Continuously: streams `/control` from Firebase. When the dashboard's Load
  Control tab flips `relay1` or `relay2`, the ESP8266 receives it via the
  Firebase stream (near-instant, no polling delay), drives the relay pin,
  and writes the confirmed state back to `/control/relay1_state` /
  `relay2_state` so the UI can show it actually took effect.

## Database schema this firmware writes/reads

```
/live
  solar:   { voltage, current, power }
  load:    { voltage, current, power }
  battery: { voltage, percent }
  faults:  { panel, battery, load, controller }
  efficiency, powerLoss, timestamp

/history/{pushId}
  (same shape as /live)

/control
  relay1:       bool   <- written by the web app (LED)
  relay2:       bool   <- written by the web app (FAN)
  relay1_state: bool   -> written by the ESP8266 (confirmed actual state)
  relay2_state: bool   -> written by the ESP8266 (confirmed actual state)
```

## Note on timestamps

The sketch currently timestamps with `millis()` (time since boot), which is
good enough for relative ordering but not wall-clock time. For accurate
historical dates on the dashboard, add NTP sync (`configTime()` /
`time(nullptr)`) and use the epoch time instead — happy to wire that in if
you want real calendar dates in the history charts.
