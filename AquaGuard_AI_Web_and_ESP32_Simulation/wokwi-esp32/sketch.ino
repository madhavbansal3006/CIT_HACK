
#include <Arduino.h>

// AquaGuard AI ESP32 controller simulation / starter.
// Replace FLOW_CALIBRATION with the value for your exact flow sensor.
constexpr int FLOW_IN_PIN = 18;
constexpr int FLOW_OUT_PIN = 19;
constexpr int TEST_LEAK_BUTTON_PIN = 25; // Button from GPIO25 to GND, INPUT_PULLUP
constexpr int PUMP_DRIVER_PIN = 26;       // Driver/relay input only, never pump directly
constexpr int VALVE_DRIVER_PIN = 27;      // Driver/relay input only, never valve directly
constexpr int STATUS_LED_PIN = 2;

constexpr float FLOW_CALIBRATION = 7.5f; // placeholder pulses/sec per L/min
constexpr float LEAK_THRESHOLD_LPM = 2.0f; // illustrative; calibrate in real setup
constexpr unsigned long SAMPLE_MS = 1000;
constexpr unsigned long PERSIST_MS = 3000;

volatile uint32_t inletPulses = 0;
volatile uint32_t outletPulses = 0;
unsigned long lastSample = 0;
unsigned long mismatchSince = 0;
bool pumpOn = true;
bool valveOpen = true;
bool alarmActive = false;
bool testLeakMode = false;
bool previousButton = HIGH;

void IRAM_ATTR countInlet() { inletPulses++; }
void IRAM_ATTR countOutlet() { outletPulses++; }

void applyOutputs() {
  digitalWrite(PUMP_DRIVER_PIN, pumpOn ? HIGH : LOW);
  digitalWrite(VALVE_DRIVER_PIN, valveOpen ? HIGH : LOW);
  digitalWrite(STATUS_LED_PIN, alarmActive ? HIGH : LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(FLOW_IN_PIN, INPUT_PULLUP);
  pinMode(FLOW_OUT_PIN, INPUT_PULLUP);
  pinMode(TEST_LEAK_BUTTON_PIN, INPUT_PULLUP);
  pinMode(PUMP_DRIVER_PIN, OUTPUT);
  pinMode(VALVE_DRIVER_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(FLOW_IN_PIN), countInlet, RISING);
  attachInterrupt(digitalPinToInterrupt(FLOW_OUT_PIN), countOutlet, RISING);
  applyOutputs();

  Serial.println();
  Serial.println("AquaGuard AI — ESP32 simulation starter");
  Serial.println("Readings depend on pulse inputs; button enables test leak mode.");
  Serial.println("Flow difference is a possible-leak indicator, not proof.");
}

void loop() {
  const unsigned long now = millis();

  bool button = digitalRead(TEST_LEAK_BUTTON_PIN);
  if (previousButton == HIGH && button == LOW) {
    testLeakMode = !testLeakMode;
    Serial.printf("[TEST] Simulated leak mode: %s\n", testLeakMode ? "ON" : "OFF");
    delay(35); // simple button debounce for starter
  }
  previousButton = button;

  if (now - lastSample >= SAMPLE_MS) {
    lastSample = now;

    noInterrupts();
    uint32_t inPulses = inletPulses;
    uint32_t outPulses = outletPulses;
    inletPulses = 0;
    outletPulses = 0;
    interrupts();

    float inletLpm = (inPulses / (float)SAMPLE_MS) * 1000.0f / FLOW_CALIBRATION;
    float outletLpm = (outPulses / (float)SAMPLE_MS) * 1000.0f / FLOW_CALIBRATION;

    // In Wokwi/demo mode only, reduce the outlet reading to represent a leak.
    // Disable this adjustment for real hardware testing.
    if (testLeakMode) outletLpm *= 0.60f;

    float difference = inletLpm - outletLpm;
    if (difference < 0) difference = 0;

    Serial.printf("Inlet: %.2f L/min | Outlet: %.2f L/min | Difference: %.2f L/min | TestLeak: %s\n",
                  inletLpm, outletLpm, difference, testLeakMode ? "ON" : "OFF");

    if (pumpOn && valveOpen && difference >= LEAK_THRESHOLD_LPM) {
      if (mismatchSince == 0) mismatchSince = now;
      if (!alarmActive && now - mismatchSince >= PERSIST_MS) {
        alarmActive = true;
        pumpOn = false;
        valveOpen = false;
        Serial.println("[ALERT] Persistent flow mismatch — possible leak detected.");
        Serial.println("[ACTION] Simulated automatic response: pump OFF, valve CLOSED.");
      }
    } else {
      mismatchSince = 0;
    }

    applyOutputs();
  }
}
