# 🌊 AquaGuard AI — Water Leakage Detection & Automatic Shutoff System

[![Hackathon Track](https://img.shields.io/badge/Hackathon-C1%3A%20Smarter%20Water%20Conservation-0284c7?style=for-the-badge)](https://github.com/madhavbansal3006/CIT_HACK)
[![Team](https://img.shields.io/badge/Team-IVISION-0d9488?style=for-the-badge)](https://github.com/madhavbansal3006/CIT_HACK)
[![Simulation Mode](https://img.shields.io/badge/Mode-Interactive%20IoT%20Twin-10b981?style=for-the-badge)](https://github.com/madhavbansal3006/CIT_HACK)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Recharts-38bdf8?style=for-the-badge)](https://github.com/madhavbansal3006/CIT_HACK)
[![Embedded](https://img.shields.io/badge/Controller-ESP32%20%7C%20Wokwi-f59e0b?style=for-the-badge)](https://github.com/madhavbansal3006/CIT_HACK)

---

## 📌 Executive Summary

**AquaGuard AI** is an intelligent differential flow monitoring and automated pipeline isolation system designed to eliminate clean water loss across municipal mains, industrial pipelines, and domestic distribution networks.

Because physical water-leakage test rigs require pressurized hydraulic testing that is currently under benchtop development, this repository provides:
1. **Interactive Web Simulation Dashboard (Digital Twin):** A high-fidelity, real-time React + TypeScript application with live fluid animation, dual Hall-effect sensor telemetry, configurable persistence heuristics, dynamic Recharts analytics, and water conservation tracking.
2. **ESP32 Firmware Starter (Wokwi-Ready):** A companion Arduino C++ firmware sketch (`wokwi-esp32/sketch.ino`) configured for hardware interrupt pulse counters (YF-S201), test injection buttons, and relay drivers for pump/valve control.

> ⚠️ **Hardware Boundary Notice:**  
> - The web application operates strictly in **SOFTWARE SIMULATION MODE**. All telemetry and flow dynamics are computed in real time.  
> - This system is **completely separate** from our working physical *JalDrishti* rainfall and water-quality sensor hardware setup.  
> - A differential flow rate is an indicator of a **possible leak**, not definitive proof. Production deployment incorporates acoustic correlation, pressure gradient checks, and diurnal consumption profiling.

---

## 🔬 Core Fluid Dynamics & Detection Logic

### 1. Differential Flow Conservation Law
Under incompressible fluid dynamics (Continuity Equation), within an isolated pipe segment with zero intentional branch off-takes:
$$\Delta Q = Q_{\text{inlet}} - Q_{\text{outlet}}$$

- When $\Delta Q \approx 0$ (within $\pm 0.30$ L/min sensor noise), pipeline integrity is **verified**.
- When $\Delta Q \ge \text{Threshold}$ persistently, fluid is escaping through a puncture, burst joint, or valve rupture.

### 2. Anti-Jitter Persistence Filter
Raw turbine flow sensors (such as the YF-S201) produce Hall-effect pulses with natural turbulence jitter ($\pm 3\% \text{ to } \pm 5\%$). Transient water hammer pulses, air bubbles, and pump startups frequently cause single-tick spikes.
- **Single-Sample Rejection:** A single reading where $\Delta Q \ge 2.0$ L/min does **not** trigger an emergency shutdown.
- **Persistence Window:** The differential violation must be continuously sustained across a configurable persistence duration (default: **3 consecutive seconds / 3 ticks**).
- **Automated Cutoff:** If sustained, the system trips into **`AUTO SHUTOFF`**:
  1. Halted Centrifugal Pump (simulating GPIO 26 Relay 1 cut).
  2. Closed Motorized Ball Valve (simulating GPIO 27 Relay 2 isolation).
  3. Ceased pipe velocity to $0.00$ L/min.
  4. Appends a timestamped audit trail entry in the Event Log.

---

## 🏗️ Interactive Web Simulation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AquaGuard AI Dashboard                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Top Bar: Team IVISION · C1 Category · SIMULATION MODE · Projector Mode │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Telemetry Grid: Sensor 1 (Inlet) │ Sensor 2 (Outlet) │ ΔQ │ System State│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Pipeline Visualizer:                                                   │ │
│ │  Source Tank ➔ Pump ➔ Sensor 1 ➔ [LEAK POINT] ➔ Sensor 2 ➔ Valve ➔ Dest │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────┬────────────────────────────────────┐ │
│ │  Operator Control Console:         │  Live Recharts Telemetry:          │ │
│ │  • Start / Stop Flow               │  • Inlet Flow Stream (Blue)        │ │
│ │  • Inject / Remove Leak            │  • Outlet Flow Stream (Teal)       │ │
│ │  • Leak Intensity Slider & Presets │  • Flow Difference ΔQ Fill (Red)   │ │
│ │  • Auto-Shutoff Toggle (ON/OFF)    │  • Configured Threshold Line       │ │
│ │  • Manual Pump & Valve Overrides   │  • Real-Time Tooltip & Legend      │ │
│ │  • Settings (Threshold & Window)   │                                    │ │
│ └────────────────────────────────────┴────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  C1 Smarter Water Conservation: Pumped │ Delivered │ Lost │ Conserved   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────┬────────────────────────────────────┐ │
│ │  Judge Demonstration Presets (A-F) │  Audit Trail & Event Log           │ │
│ └────────────────────────────────────┴────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Smarter Water Conservation Accounting (Category C1)

AquaGuard AI directly quantifies its water-saving impact:

$$\text{Fluid Mass Balance: } \text{Total Pumped} \approx \text{Delivered Downstream} + \text{Lost in Leak}$$
$$\text{Conservation Impact: } \text{Conserved Volume} = \text{Potential Leak Loss Prevented While in AUTO SHUTOFF}$$

* **Total Water Pumped:** Gross volume drawn from the source reservoir.
* **Delivered Downstream:** Clean volume safely delivered to the destination.
* **Water Lost in Leak:** Volume escaped through the breach prior to automated isolation.
* **Conserved Volume:** Projected water saved per second while isolated in `AUTO SHUTOFF` that would have otherwise flooded the environment. *(Never double-counted with intake water).*

---

## 🎯 Hackathon Judge Demonstration Scenarios

The dashboard features **1-click test scenarios** built specifically for hackathon evaluation:

| Preset | Title | Condition | Expected Outcome |
|:---|:---|:---|:---|
| **Demo A** | **Normal Flow** | $\Delta Q < 0.3$ L/min nominal noise | Status `NORMAL`, clean delivery, no alarm. |
| **Demo B** | **Discrepancy Below Threshold** | $1.1$ L/min discrepancy injected ($< 2.0$ L/min) | Proves false-trip rejection. Persistence stays 0. |
| **Demo C** | **Persistent Possible Leak** | $3.2$ L/min loss injected ($> 2.0$ L/min) | Counts 1s $\to$ 2s $\to$ 3s, then executes **`AUTO SHUTOFF`**. |
| **Demo D** | **Major Pipe Fracture** | Sudden severe $5.8$ L/min burst | High differential rapidly triggers emergency isolation. |
| **Demo E** | **Manual Operator Intervention** | Operator manually stops pump | Flow drops cleanly to zero; status updates to `STOPPED`. |
| **Demo F** | **Auto-Shutoff Disabled** | Leak injected with Auto-Shutoff `OFF` | Alarms trigger but water continues escaping indefinitely (baseline risk). |

---

## 🔌 Hardware Target Pinout (ESP32 Firmware Companion)

The companion Arduino sketch located in [`AquaGuard_AI_Web_and_ESP32_Simulation/wokwi-esp32/sketch.ino`](AquaGuard_AI_Web_and_ESP32_Simulation/wokwi-esp32/sketch.ino) mirrors the web twin's detection logic:

| Function | ESP32 GPIO | Electrical Interface | Role / Safety Specification |
|:---|:---:|:---|:---|
| **Inlet Flow Sensor (YF-S201)** | `GPIO 18` | Hardware Interrupt (`FALLING`) | Pulse counter ($F = 7.5 \times Q$, where $Q$ is L/min) |
| **Outlet Flow Sensor (YF-S201)** | `GPIO 19` | Hardware Interrupt (`FALLING`) | Downstream delivery pulse counter |
| **Test Leak Button** | `GPIO 25` | Active-LOW (`INPUT_PULLUP`) | Hardware benchtop test simulation button |
| **Centrifugal Pump Driver** | `GPIO 26` | Optocoupled Relay / MOSFET | Digital output to pump driver (flyback diode protected) |
| **Motorized Valve Driver** | `GPIO 27` | Optocoupled Relay | Digital output to Normally Closed (NC) solenoid valve |
| **System Status LED** | `GPIO 2` | Digital Output | Onboard status heartbeat & alarm indicator |

---

## 📁 Repository Structure

```text
.
├── .gitignore                                      # Comprehensive Git exclusion rules
├── README.md                                       # Root project documentation
├── package-lock.json                               # Workspace lockfile
└── AquaGuard_AI_Web_and_ESP32_Simulation/
    ├── README.md                                   # Component-level guide
    ├── web-simulation/                             # Full-Stack React + Vite Web Twin
    │   ├── index.html                              # Web app entry point & metadata
    │   ├── package.json                            # Scripts, dependencies & React types
    │   ├── tsconfig.json                           # Strict TypeScript configuration
    │   ├── vite.config.ts                          # Vite bundler & chunk optimizations
    │   ├── verify_aquaguard.cjs                    # Automated 11-point test suite
    │   └── src/
    │       ├── main.tsx                            # Root React mounting point
    │       ├── App.tsx                             # Dashboard layout & state composition
    │       ├── style.css                           # Professional Navy/Teal responsive styling
    │       ├── types/
    │       │   └── simulation.ts                   # Strongly-typed telemetry & state models
    │       ├── hooks/
    │       │   └── useWaterSimulation.ts           # IoT simulation engine & persistence state-machine
    │       └── components/
    │           ├── Header.tsx                      # Top bar with Projector Mode & Reset
    │           ├── NoticeBanner.tsx                # Software simulation engineering disclaimer
    │           ├── MetricsGrid.tsx                 # Telemetry cards & threshold meters
    │           ├── PipelineVisualizer.tsx          # Animated fluid dynamics pipeline diagram
    │           ├── ControlsPanel.tsx               # Operator controls & calibration settings
    │           ├── FlowChart.tsx                   # Live Recharts dual-area flow chart
    │           ├── WaterConservationStats.tsx      # C1 category water volume accounting
    │           ├── ScenariosPanel.tsx              # Hackathon judge 1-click test presets
    │           ├── EventLogPanel.tsx               # Timestamped audit trail with category filters
    │           └── EngineeringModal.tsx            # Deep technical guide & hardware bridge
    └── wokwi-esp32/                                # ESP32 Firmware & Circuit Starter
        ├── README.md                               # Wokwi simulation guide
        ├── diagram.json                            # Circuit layout starter
        └── sketch.ino                              # ESP32 dual-interrupt controller firmware
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher (tested on Node v22.x)
* **npm:** v9.0.0 or higher

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/madhavbansal3006/CIT_HACK.git
cd CIT_HACK/AquaGuard_AI_Web_and_ESP32_Simulation/web-simulation

# Install dependencies
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 3. Run Automated Verification Tests
```bash
npm test
```
Executes `verify_aquaguard.cjs` to validate all state transitions, persistence filters, and water accounting math.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🏆 Presentation Walkthrough for Judges (3-Minute Script)

1. **The Problem & Baseline (0:00 - 0:30):**  
   *“Over 30% of treated municipal water is lost to unmonitored pipeline leaks. AquaGuard AI introduces differential telemetry to catch leaks instantly before they cause catastrophic loss.”*  
   *(Show Demo A: Normal Flow running at ~12.3 L/min inlet, ~12.1 L/min outlet).*

2. **False-Positive Rejection (0:30 - 1:15):**  
   *“Turbine sensors like the YF-S201 have natural noise. Clicking Demo B injects a minor 1.1 L/min discrepancy. Notice that AquaGuard AI does NOT trip an alarm or shut down because it intelligently filters out noise below the 2.0 L/min threshold.”*

3. **Sustained Leak Detection & Emergency Auto-Cutoff (1:15 - 2:15):**  
   *“When a genuine fracture occurs (Demo C), water bursts out at the pipe fracture point. Watch the persistence timer: 1s... 2s... 3s. At 3 seconds, the system activates Auto-Shutoff: the pump halts, the motorized valve closes, and flow drops to 0.00 L/min.”*

4. **Conservation Impact & Physical IoT Bridge (2:15 - 3:00):**  
   *“In our Water Conservation Analytics card, we quantify exact liters saved by cutting off the leak early. Clicking IoT Engineering shows our ESP32 companion firmware pin map (GPIO 18/19 interrupt sensors and GPIO 26/27 relays) ready for physical benchtop deployment.”*

---

## 👥 Team & Hackathon Credits

* **Team:** IVISION
* **Track:** Category C1 — Smarter Water Conservation
* **Repository:** [https://github.com/madhavbansal3006/CIT_HACK](https://github.com/madhavbansal3006/CIT_HACK)
