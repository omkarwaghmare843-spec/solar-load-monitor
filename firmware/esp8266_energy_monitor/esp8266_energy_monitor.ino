/*
  Renewable Energy Monitoring System — ESP8266 firmware

  Hardware:
    - ESP8266 (NodeMCU / Wemos D1 mini)
    - INA219 #1 (Solar)  — I2C address 0x44 (A0 shorted to VS+)
    - INA219 #2 (Load)   — I2C address 0x40 (default, unshorted)
    - 2-channel relay module, active-LOW
        IN1 -> D5 -> controls LED
        IN2 -> D6 -> controls FAN

  I2C bus: SDA = D2 (GPIO4), SCL = D1 (GPIO5) — standard ESP8266 default pins.

  Behavior:
    - Reads both INA219 sensors every LOOP_INTERVAL_MS.
    - Computes battery %, efficiency, power loss, and fault flags.
    - Publishes a live snapshot to /live and appends to /history.
    - Streams /control from Firebase RTDB; whenever the dashboard flips
      relay1 or relay2, the ESP8266 drives the relay pins immediately and
      writes back the confirmed state to /control/relay1_state / relay2_state.

  Libraries required (Arduino Library Manager):
    - FirebaseESP8266 by mobizt
    - Adafruit INA219
    - Adafruit BusIO (dependency of the above)
*/

#include <ESP8266WiFi.h>
#include <Wire.h>
#include <time.h>
#include <Adafruit_INA219.h>
#include <FirebaseESP8266.h>

// ---------------- WiFi & Firebase credentials ----------------
#define WIFI_SSID        "YOUR_WIFI_SSID"
#define WIFI_PASSWORD    "YOUR_WIFI_PASSWORD"

#define FIREBASE_HOST    "load-monitor-51924-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH    "YOUR_FIREBASE_DATABASE_SECRET" // Realtime Database secret (legacy token)

// ---------------- Pin assignments ----------------
#define RELAY1_PIN D5   // LED
#define RELAY2_PIN D6   // FAN
#define RELAY_ACTIVE_LOW true

// ---------------- INA219 addresses ----------------
#define INA219_SOLAR_ADDR 0x44  // A0 shorted to VS+
#define INA219_LOAD_ADDR  0x40  // default, unshorted

// ---------------- Thresholds (mirrors docs/flow-diagram.jpeg) ----------------
const float BATTERY_LOW_VOLTAGE   = 9.6f;
const float BATTERY_FULL_VOLTAGE  = 12.6f;
const float BATTERY_MIN_VOLTAGE   = 9.0f;
const float LOAD_MAX_CURRENT      = 1.0f;
const float SOLAR_LOW_POWER       = 0.5f;

const unsigned long LOOP_INTERVAL_MS    = 2000;   // read + publish /live every 2s
const unsigned long HISTORY_INTERVAL_MS = 60000;  // append /history once a minute

// NTP / time sync — RTDB timestamps need real epoch time, not millis()
#define GMT_OFFSET_SEC   (5 * 3600 + 1800)  // IST = UTC+5:30; adjust for your timezone
#define DST_OFFSET_SEC   0

Adafruit_INA219 inaSolar(INA219_SOLAR_ADDR);
Adafruit_INA219 inaLoad(INA219_LOAD_ADDR);

FirebaseData fbLive;
FirebaseData fbHistory;
FirebaseData fbStream;

unsigned long lastLoopMs = 0;
unsigned long lastHistoryMs = 0;

bool relay1State = false; // LED — logical ON/OFF (true = ON)
bool relay2State = false; // FAN

double epochMillis() {
  return (double)time(nullptr) * 1000.0;
}

void applyRelay(uint8_t pin, bool on) {
  bool level = RELAY_ACTIVE_LOW ? !on : on;
  digitalWrite(pin, level ? HIGH : LOW);
}

void streamCallback(StreamData data) {
  String path = data.dataPath();

  if (path == "/relay1" && data.dataType() == "boolean") {
    relay1State = data.boolData();
    applyRelay(RELAY1_PIN, relay1State);
    Firebase.setBool(fbLive, "/control/relay1_state", relay1State);
  } else if (path == "/relay2" && data.dataType() == "boolean") {
    relay2State = data.boolData();
    applyRelay(RELAY2_PIN, relay2State);
    Firebase.setBool(fbLive, "/control/relay2_state", relay2State);
  } else if (path == "/" && data.dataType() == "json") {
    // Initial full read of /control on (re)connect
    FirebaseJson &json = data.jsonObject();
    FirebaseJsonData result;
    if (json.get(result, "relay1") && result.typeStr == "boolean") {
      relay1State = result.boolValue;
      applyRelay(RELAY1_PIN, relay1State);
    }
    if (json.get(result, "relay2") && result.typeStr == "boolean") {
      relay2State = result.boolValue;
      applyRelay(RELAY2_PIN, relay2State);
    }
    Firebase.setBool(fbLive, "/control/relay1_state", relay1State);
    Firebase.setBool(fbLive, "/control/relay2_state", relay2State);
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("Stream timeout, resuming...");
  }
  if (!fbStream.httpConnected()) {
    Serial.printf("Stream error: %s\n", fbStream.errorReason().c_str());
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  applyRelay(RELAY1_PIN, false);
  applyRelay(RELAY2_PIN, false);

  Wire.begin(); // SDA=D2, SCL=D1 by default on ESP8266

  if (!inaSolar.begin()) {
    Serial.println("Solar INA219 (0x44) not found!");
  }
  if (!inaLoad.begin()) {
    Serial.println("Load INA219 (0x40) not found!");
  }

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());

  configTime(GMT_OFFSET_SEC, DST_OFFSET_SEC, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing time");
  time_t nowSec = time(nullptr);
  while (nowSec < 8 * 3600 * 2) { // wait until epoch looks sane (past 1970+a bit)
    delay(300);
    Serial.print(".");
    nowSec = time(nullptr);
  }
  Serial.println("\nTime synced: " + String(ctime(&nowSec)));

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  if (!Firebase.beginStream(fbStream, "/control")) {
    Serial.println("Could not begin stream: " + fbStream.errorReason());
  }
  Firebase.setStreamCallback(fbStream, streamCallback, streamTimeoutCallback);
}

float estimateBatteryPercent(float voltage) {
  float pct = (voltage - BATTERY_MIN_VOLTAGE) / (BATTERY_FULL_VOLTAGE - BATTERY_MIN_VOLTAGE) * 100.0f;
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}

void publishLive(float sV, float sI, float sP,
                  float lV, float lI, float lP,
                  float battV, float battPct,
                  float efficiency, float powerLoss,
                  bool faultPanel, bool faultBattery, bool faultLoad, bool faultController) {
  FirebaseJson json;
  json.set("solar/voltage", sV);
  json.set("solar/current", sI);
  json.set("solar/power", sP);
  json.set("load/voltage", lV);
  json.set("load/current", lI);
  json.set("load/power", lP);
  json.set("battery/voltage", battV);
  json.set("battery/percent", battPct);
  json.set("faults/panel", faultPanel);
  json.set("faults/battery", faultBattery);
  json.set("faults/load", faultLoad);
  json.set("faults/controller", faultController);
  json.set("efficiency", efficiency);
  json.set("powerLoss", powerLoss);
  json.set("timestamp", epochMillis());

  if (!Firebase.setJSON(fbLive, "/live", json)) {
    Serial.println("Failed to write /live: " + fbLive.errorReason());
  }
}

void appendHistory(float sV, float sI, float sP,
                    float lV, float lI, float lP,
                    float battV, float battPct,
                    float efficiency, float powerLoss,
                    bool faultPanel, bool faultBattery, bool faultLoad, bool faultController) {
  FirebaseJson json;
  json.set("solar/voltage", sV);
  json.set("solar/current", sI);
  json.set("solar/power", sP);
  json.set("load/voltage", lV);
  json.set("load/current", lI);
  json.set("load/power", lP);
  json.set("battery/voltage", battV);
  json.set("battery/percent", battPct);
  json.set("faults/panel", faultPanel);
  json.set("faults/battery", faultBattery);
  json.set("faults/load", faultLoad);
  json.set("faults/controller", faultController);
  json.set("efficiency", efficiency);
  json.set("powerLoss", powerLoss);
  json.set("timestamp", epochMillis());

  if (!Firebase.pushJSON(fbHistory, "/history", json)) {
    Serial.println("Failed to push /history: " + fbHistory.errorReason());
  }
}

void loop() {
  unsigned long now = millis();

  if (now - lastLoopMs >= LOOP_INTERVAL_MS) {
    lastLoopMs = now;

    float sV = inaSolar.getBusVoltage_V();
    float sI = inaSolar.getCurrent_mA() / 1000.0f;
    float sP = sV * sI;

    float lV = inaLoad.getBusVoltage_V();
    float lI = inaLoad.getCurrent_mA() / 1000.0f;
    float lP = lV * lI;

    float battV = lV; // battery rail is read via the load INA219's bus voltage
    float battPct = estimateBatteryPercent(battV);

    float efficiency = (sP > 0.01f) ? (lP / sP) * 100.0f : 0.0f;
    float powerLoss = sP - lP;

    bool faultBattery = (battV < BATTERY_LOW_VOLTAGE) || (battV > BATTERY_FULL_VOLTAGE);
    bool faultLoad = (lI > LOAD_MAX_CURRENT);
    bool faultPanel = (sP < SOLAR_LOW_POWER);
    bool faultController = false; // reserved for future MPPT/controller diagnostics

    publishLive(sV, sI, sP, lV, lI, lP, battV, battPct, efficiency, powerLoss,
                faultPanel, faultBattery, faultLoad, faultController);

    Serial.printf("Solar: %.2fV %.2fA %.2fW | Load: %.2fV %.2fA %.2fW | Batt: %.2fV (%.0f%%) | Eff: %.1f%%\n",
                  sV, sI, sP, lV, lI, lP, battV, battPct, efficiency);

    if (now - lastHistoryMs >= HISTORY_INTERVAL_MS) {
      lastHistoryMs = now;
      appendHistory(sV, sI, sP, lV, lI, lP, battV, battPct, efficiency, powerLoss,
                    faultPanel, faultBattery, faultLoad, faultController);
    }
  }
}
