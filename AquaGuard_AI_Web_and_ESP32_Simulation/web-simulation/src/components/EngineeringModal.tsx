import React from 'react';
import { X, BookOpen, Cpu, ShieldCheck, AlertCircle, Wrench, Layers } from 'lucide-react';

interface EngineeringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineeringModal: React.FC<EngineeringModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <BookOpen size={20} className="modal-icon" />
            <div>
              <h3>AquaGuard AI — IoT Engineering & Physics Documentation</h3>
              <p>Differential Flow Principles, Sensor Calibration & Physical Circuit Architecture</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-scroll">
          
          {/* Important Simulation Boundary Notice */}
          <div className="eng-notice-box">
            <AlertCircle size={20} className="eng-notice-icon" />
            <div>
              <strong>Software Simulation Boundary Disclaimer:</strong>
              <p>
                This web dashboard operates in <strong>SIMULATION MODE</strong>. All telemetry readings, flow noise, and actuator responses are generated in software for algorithm demonstration. This system is completely standalone and strictly separate from the physical <em>JalDrishti</em> rainfall and water-quality hardware.
              </p>
            </div>
          </div>

          {/* Section 1: Differential Conservation Law */}
          <div className="eng-section">
            <div className="eng-section-title">
              <Layers size={18} />
              <h4>1. Differential Flow Physics & Mass Conservation</h4>
            </div>
            <p>
              Under incompressible fluid dynamics (Continuity Equation), within a closed pipe segment without intentional branch draw:
            </p>
            <div className="eng-formula-box">
              <code>Q_inlet - Q_outlet = ΔQ (Net Fluid Loss)</code>
            </div>
            <p>
              When <code>ΔQ ≈ 0</code> (within sensor tolerance), the pipeline integrity is confirmed. When <code>ΔQ &gt; Threshold</code> persistently, fluid is escaping through a puncture, fitting failure, or burst seam.
            </p>
          </div>

          {/* Section 2: Sensor Calibration & Noise Filtering */}
          <div className="eng-section">
            <div className="eng-section-title">
              <Wrench size={18} />
              <h4>2. Hall-Effect Flow Sensor Calibration (YF-S201)</h4>
            </div>
            <p>
              In the physical IoT controller (ESP32), pulse-based Hall-effect turbine sensors (such as the YF-S201) generate square-wave pulses proportional to fluid velocity:
            </p>
            <ul>
              <li><strong>Pulse Frequency Formula:</strong> <code>F = 7.5 × Q</code> (where <code>F</code> is in Hz and <code>Q</code> is in L/min).</li>
              <li><strong>Volume per Pulse:</strong> Approximately <code>2.25 mL</code> per magnetic transition.</li>
              <li><strong>Tolerance & Noise:</strong> Physical turbine sensors feature an inherent measurement error of <strong>±3% to ±5%</strong> depending on Reynolds number and pipe turbulence.</li>
              <li><strong>Persistence Check (Anti-Jitter Heuristic):</strong> A single high-difference sample must <em>never</em> trigger emergency shutoff. Transient pressure pulses, cavitation bubbles, and valve water hammer can momentarily skew readings. AquaGuard AI requires a configurable persistence window (default ~3 seconds) before taking shutoff action.</li>
            </ul>
          </div>

          {/* Section 3: Hardware Safety & Electrical Isolation */}
          <div className="eng-section">
            <div className="eng-section-title">
              <Cpu size={18} />
              <h4>3. Embedded Controller Hardware Map (ESP32)</h4>
            </div>
            <div className="eng-table-wrapper">
              <table className="eng-pin-table">
                <thead>
                  <tr>
                    <th>Signal Function</th>
                    <th>ESP32 GPIO</th>
                    <th>Electrical Interface</th>
                    <th>Safety Mechanism</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Flow Sensor 1 (Inlet)</td>
                    <td>GPIO 18</td>
                    <td>Hardware Interrupt (FALLING edge)</td>
                    <td>Debounced pulse counter</td>
                  </tr>
                  <tr>
                    <td>Flow Sensor 2 (Outlet)</td>
                    <td>GPIO 19</td>
                    <td>Hardware Interrupt (FALLING edge)</td>
                    <td>Debounced pulse counter</td>
                  </tr>
                  <tr>
                    <td>Simulated Leak Button</td>
                    <td>GPIO 25</td>
                    <td>Active-LOW Input with Pull-Up</td>
                    <td>Hardware test toggle</td>
                  </tr>
                  <tr>
                    <td>Centrifugal Pump Driver</td>
                    <td>GPIO 26</td>
                    <td>Optocoupled Relay / MOSFET Module</td>
                    <td>Flyback diode & separate DC supply</td>
                  </tr>
                  <tr>
                    <td>Motorized Isolation Valve</td>
                    <td>GPIO 27</td>
                    <td>Optocoupled Relay Driver</td>
                    <td>Normally Closed (NC) failsafe</td>
                  </tr>
                  <tr>
                    <td>Status Indicator LED</td>
                    <td>GPIO 2</td>
                    <td>Built-in LED output</td>
                    <td>Visual heartbeat / alarm flash</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Machine Learning Roadmap */}
          <div className="eng-section">
            <div className="eng-section-title">
              <ShieldCheck size={18} />
              <h4>4. Machine Learning & Anomaly Detection Roadmap</h4>
            </div>
            <p>
              In production municipal or building management networks, normal water consumption varies by time of day, household usage, and pressure fluctuations. AquaGuard AI's future AI roadmap incorporates:
            </p>
            <ul>
              <li><strong>Dynamic Baseline Profiling:</strong> Learning diurnal consumption curves (morning peaks, night baseline).</li>
              <li><strong>Statistical Z-Score Anomaly Detection:</strong> Dynamically scaling trip thresholds based on flow standard deviations.</li>
              <li><strong>Acoustic & Pressure Fusion:</strong> Correlating hydrophone acoustic frequency spikes with differential flow drop to pinpoint leak location along the pipe.</li>
            </ul>
          </div>

        </div>

        <div className="modal-footer">
          <span className="modal-footer-caption">
            AquaGuard AI · Team IVISION · C1 Smarter Water Conservation
          </span>
          <button className="ctrl-btn btn-start" onClick={onClose}>
            Close Reference Guide
          </button>
        </div>
      </div>
    </div>
  );
};

