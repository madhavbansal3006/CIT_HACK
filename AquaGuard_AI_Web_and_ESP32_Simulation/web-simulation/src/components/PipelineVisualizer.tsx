import React from 'react';
import { 
  Zap, 
  Waves, 
  Droplet, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  ArrowRight,
  Disc
} from 'lucide-react';
import { SystemStatus } from '../types/simulation';

interface PipelineVisualizerProps {
  running: boolean;
  pump: boolean;
  valve: boolean;
  leak: boolean;
  leakIntensity: number;
  inletFlow: number;
  outletFlow: number;
  systemStatus: SystemStatus;
  onToggleLeak: () => void;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  running,
  pump,
  valve,
  leak,
  leakIntensity,
  inletFlow,
  outletFlow,
  systemStatus,
  onToggleLeak,
}) => {
  const isUpstreamFlowing = running && pump;
  const isDownstreamFlowing = running && pump && valve;

  return (
    <div className={`pipeline-card ${systemStatus === 'AUTO_SHUTOFF' ? 'pipeline-alarm-mode' : ''}`}>
      <div className="pipeline-card-header">
        <div className="pipeline-title-row">
          <Waves className="pipeline-icon" size={20} />
          <h2 className="pipeline-title">Physical Pipeline Architecture & Fluid Dynamics</h2>
        </div>
        <div className="pipeline-header-badges">
          <span className="pipeline-badge">
            TOPOLOGY: INLET → FRACTURE POINT → OUTLET
          </span>
          <span className={`status-pill ${leak ? 'pill-leak' : 'pill-sealed'}`}>
            {leak ? `LEAK INJECTED (-${leakIntensity.toFixed(1)} L/min)` : 'PIPELINE INTEGRAL'}
          </span>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="pipeline-diagram-wrapper">
        <div className="pipeline-stage">
          
          {/* 1. SOURCE TANK */}
          <div className="diagram-component tank-component source-tank">
            <div className="tank-reservoir">
              <div className="tank-water source-water">
                <div className="water-wave-layer" />
              </div>
              <div className="tank-level-markers">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
              </div>
            </div>
            <div className="component-label">
              <strong>Source Tank</strong>
              <small>Simulated Reservoir</small>
            </div>
          </div>

          {/* Pipe Segment 1: Tank to Pump */}
          <div className={`pipe-run ${isUpstreamFlowing ? 'flow-active' : ''}`}>
            {isUpstreamFlowing && <div className="water-particles" />}
          </div>

          {/* 2. CENTRIFUGAL PUMP */}
          <div className={`diagram-component pump-component ${pump ? 'active-pump' : 'idle-pump'}`}>
            <div className="pump-casing">
              <div className={`pump-impeller ${isUpstreamFlowing ? 'spin-fast' : ''}`}>
                <Disc size={30} />
              </div>
              <Zap size={14} className="pump-spark" />
            </div>
            <div className="component-label">
              <strong>Pump (Relay 1)</strong>
              <small className={pump ? 'text-teal' : 'text-danger'}>
                {pump ? 'RUNNING (Target: GPIO 26)' : 'STOPPED'}
              </small>
            </div>
          </div>

          {/* Pipe Segment 2: Pump to Sensor 1 */}
          <div className={`pipe-run ${isUpstreamFlowing ? 'flow-active' : ''}`}>
            {isUpstreamFlowing && <div className="water-particles" />}
          </div>

          {/* 3. FLOW SENSOR 1 (INLET) */}
          <div className="diagram-component sensor-component inlet-sensor-node">
            <div className="sensor-housing">
              <div className={`sensor-turbine ${isUpstreamFlowing ? 'spin-moderate' : ''}`}>
                <Waves size={22} />
              </div>
              <div className="sensor-chip-badge">YF-S201</div>
            </div>
            <div className="component-label">
              <strong>Flow Sensor 1</strong>
              <div className="sensor-live-pill">{inletFlow.toFixed(1)} L/min</div>
              <small>Simulated Inlet (GPIO 18 Target)</small>
            </div>
          </div>

          {/* Pipe Segment 3: Sensor 1 to Leak Point */}
          <div className={`pipe-run ${isUpstreamFlowing ? 'flow-active' : ''}`}>
            {isUpstreamFlowing && <div className="water-particles" />}
          </div>

          {/* 4. LEAK INJECTION POINT */}
          <div 
            className={`diagram-component leak-junction-component ${leak ? 'leak-bursting' : 'leak-sealed'}`}
            onClick={onToggleLeak}
            title="Click to toggle simulated pipe fracture"
          >
            <div className="leak-manifold">
              {leak ? (
                <>
                  <div className="leak-spray-animation">
                    <span className="drop drop-1"><Droplet size={12} /></span>
                    <span className="drop drop-2"><Droplet size={14} /></span>
                    <span className="drop drop-3"><Droplet size={10} /></span>
                  </div>
                  <AlertTriangle size={24} className="leak-alert-icon" />
                </>
              ) : (
                <div className="sealed-pipe-joint">
                  <CheckCircle size={20} className="sealed-icon" />
                </div>
              )}
            </div>
            <div className="component-label leak-label">
              <strong>{leak ? 'PIPE FRACTURE' : 'PIPE JOINT'}</strong>
              <div className={`leak-tag-pill ${leak ? 'leak-tag-active' : 'leak-tag-ok'}`}>
                {leak ? `-${leakIntensity.toFixed(1)} L/min Lost` : 'No Breach'}
              </div>
              <small className="interactive-hint">Click to toggle</small>
            </div>
          </div>

          {/* Pipe Segment 4: Leak Point to Sensor 2 */}
          <div className={`pipe-run ${isDownstreamFlowing ? 'flow-active' : ''}`}>
            {isDownstreamFlowing && <div className="water-particles" />}
          </div>

          {/* 5. FLOW SENSOR 2 (OUTLET) */}
          <div className="diagram-component sensor-component outlet-sensor-node">
            <div className="sensor-housing">
              <div className={`sensor-turbine ${isDownstreamFlowing ? 'spin-moderate' : ''}`}>
                <Waves size={22} />
              </div>
              <div className="sensor-chip-badge">YF-S201</div>
            </div>
            <div className="component-label">
              <strong>Flow Sensor 2</strong>
              <div className="sensor-live-pill teal-pill">{outletFlow.toFixed(1)} L/min</div>
              <small>Simulated Outlet (GPIO 19 Target)</small>
            </div>
          </div>

          {/* Pipe Segment 5: Sensor 2 to Valve */}
          <div className={`pipe-run ${isDownstreamFlowing ? 'flow-active' : ''}`}>
            {isDownstreamFlowing && <div className="water-particles" />}
          </div>

          {/* 6. CONTROLLED MOTORIZED VALVE */}
          <div className={`diagram-component valve-component ${valve ? 'valve-open' : 'valve-closed'}`}>
            <div className="valve-housing">
              <div className={`valve-gate-indicator ${valve ? 'gate-aligned' : 'gate-blocked'}`} />
              <Sliders size={20} className="valve-symbol-icon" />
            </div>
            <div className="component-label">
              <strong>Solenoid / Ball Valve</strong>
              <small className={valve ? 'text-teal' : 'text-danger'}>
                {valve ? 'OPEN (Target: GPIO 27)' : 'CLOSED (ISOLATED)'}
              </small>
            </div>
          </div>

          {/* Pipe Segment 6: Valve to Destination */}
          <div className={`pipe-run ${isDownstreamFlowing ? 'flow-active' : ''}`}>
            {isDownstreamFlowing && <div className="water-particles" />}
          </div>

          {/* 7. DESTINATION TANK */}
          <div className="diagram-component tank-component dest-tank">
            <div className="tank-reservoir">
              <div className={`tank-water dest-water ${isDownstreamFlowing ? 'filling-anim' : ''}`}>
                <div className="water-wave-layer" />
              </div>
              <div className="tank-level-markers">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
              </div>
            </div>
            <div className="component-label">
              <strong>Destination</strong>
              <small>Distribution Main</small>
            </div>
          </div>

        </div>
      </div>

      {/* Pipeline Diagram Legend & Telemetry Summary */}
      <div className="pipeline-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-line blue-fluid" />
            <span>Simulated Pressurized Water Flow</span>
          </div>
          <div className="legend-item">
            <span className="legend-line red-leak" />
            <span>Breach Escape Zone (Loss ΔQ)</span>
          </div>
          <div className="legend-item">
            <span className="legend-node-dot" />
            <span>Dual YF-S201 Hall-Effect Interrupt Probes</span>
          </div>
        </div>
        <div className="pipeline-quick-stats">
          <span>Inlet: <b>{inletFlow.toFixed(1)} L/m</b></span>
          <span className="arrow-sep">→</span>
          <span>Outlet: <b>{outletFlow.toFixed(1)} L/m</b></span>
          <span className="arrow-sep">→</span>
          <span>Loss: <b className={leak ? 'text-danger' : 'text-teal'}>{(Math.max(0, inletFlow - outletFlow)).toFixed(1)} L/m</b></span>
        </div>
      </div>
    </div>
  );
};

