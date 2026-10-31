import React from 'react';
import { 
  Waves, 
  Droplets, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Power, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { SystemStatus } from '../types/simulation';

interface MetricsGridProps {
  inletFlow: number;
  outletFlow: number;
  flowDifference: number;
  threshold: number;
  persistenceCounter: number;
  persistenceRequired: number;
  systemStatus: SystemStatus;
  pump: boolean;
  valve: boolean;
  autoShutoff: boolean;
  running: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  inletFlow,
  outletFlow,
  flowDifference,
  threshold,
  persistenceCounter,
  persistenceRequired,
  systemStatus,
  pump,
  valve,
  autoShutoff,
  running,
}) => {
  const isOverThreshold = flowDifference >= threshold && running && pump && valve;

  // Status mapping
  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'NORMAL':
        return { label: 'NORMAL FLOW', class: 'status-normal', icon: CheckCircle2, desc: 'Nominal distribution' };
      case 'SUSPECTED_LEAK':
        return { label: 'POSSIBLE LEAK', class: 'status-warn', icon: AlertTriangle, desc: 'Differential trip in progress' };
      case 'AUTO_SHUTOFF':
        return { label: 'AUTO SHUTOFF', class: 'status-danger', icon: ShieldCheck, desc: 'Pump halted & valve closed' };
      case 'STOPPED':
        return { label: 'STOPPED', class: 'status-muted', icon: Power, desc: 'Manual pump halt' };
      case 'MANUAL_OVERRIDE':
        return { label: 'OVERRIDE', class: 'status-override', icon: SlidersHorizontal, desc: 'Actuator manual lock' };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  // Flow difference percentage of threshold
  const diffPercentage = Math.min(100, Math.round((flowDifference / threshold) * 100));

  return (
    <section className="metrics-grid" aria-label="System Telemetry">
      {/* Sensor 1: Inlet Flow */}
      <div className="metric-card inlet-card">
        <div className="metric-header">
          <div className="metric-icon-box blue-box">
            <Waves size={20} className={running && pump ? 'spin-subtle' : ''} />
          </div>
          <div className="metric-tag">UPSTREAM · SENSOR 1 (SIMULATED)</div>
        </div>
        <div className="metric-body">
          <div className="metric-number-row">
            <span className="metric-value">{inletFlow.toFixed(2)}</span>
            <span className="metric-unit">L/min</span>
          </div>
          <div className="metric-subtext">
            {running && pump ? 'Active centrifugal intake' : 'Pump idle · Zero velocity'}
          </div>
        </div>
        <div className="metric-footer">
          <span className="pin-indicator">Target Pin: ESP32 GPIO 18 (Virtual)</span>
          <span className={`status-dot ${running && pump ? 'dot-active' : 'dot-idle'}`} />
        </div>
      </div>

      {/* Sensor 2: Outlet Flow */}
      <div className="metric-card outlet-card">
        <div className="metric-header">
          <div className="metric-icon-box teal-box">
            <Droplets size={20} className={running && pump && valve ? 'spin-subtle' : ''} />
          </div>
          <div className="metric-tag">DOWNSTREAM · SENSOR 2 (SIMULATED)</div>
        </div>
        <div className="metric-body">
          <div className="metric-number-row">
            <span className="metric-value">{outletFlow.toFixed(2)}</span>
            <span className="metric-unit">L/min</span>
          </div>
          <div className="metric-subtext">
            {running && pump && valve 
              ? 'Destination delivery flow' 
              : !valve ? 'Valve shut · Line blocked' : 'Intake zeroed'}
          </div>
        </div>
        <div className="metric-footer">
          <span className="pin-indicator">Target Pin: ESP32 GPIO 19 (Virtual)</span>
          <span className={`status-dot ${running && pump && valve ? 'dot-active' : 'dot-idle'}`} />
        </div>
      </div>

      {/* Flow Difference (Delta Q) */}
      <div className={`metric-card diff-card ${isOverThreshold ? 'alert-border' : ''}`}>
        <div className="metric-header">
          <div className={`metric-icon-box ${isOverThreshold ? 'red-box' : 'purple-box'}`}>
            <Activity size={20} />
          </div>
          <div className="metric-tag">
            ΔQ = Q_in - Q_out (SIMULATED)
          </div>
        </div>
        <div className="metric-body">
          <div className="metric-number-row">
            <span className={`metric-value ${isOverThreshold ? 'text-danger' : 'text-purple'}`}>
              {flowDifference.toFixed(2)}
            </span>
            <span className="metric-unit">L/min</span>
          </div>
          
          <div className="threshold-meter-container">
            <div className="threshold-meter-bar">
              <div 
                className={`threshold-fill ${isOverThreshold ? 'fill-danger' : 'fill-purple'}`}
                style={{ width: `${diffPercentage}%` }}
              />
            </div>
            <div className="threshold-meter-labels">
              <span>0</span>
              <span className="threshold-marker" title="Configured trip threshold">
                Limit: {threshold.toFixed(1)} L/min
              </span>
            </div>
          </div>
        </div>
        <div className="metric-footer">
          {persistenceCounter > 0 ? (
            <span className="persistence-alert">
              Sustained: {persistenceCounter}s / {persistenceRequired}s
            </span>
          ) : (
            <span className="text-secondary">
              {flowDifference >= threshold ? 'Evaluating threshold...' : 'Normal variance (< limit)'}
            </span>
          )}
          <span className={`status-dot ${isOverThreshold ? 'dot-danger' : 'dot-active'}`} />
        </div>
      </div>

      {/* System Status & Actuators */}
      <div className={`metric-card status-card ${systemStatus === 'AUTO_SHUTOFF' ? 'shutoff-glow' : ''}`}>
        <div className="metric-header">
          <div className={`metric-icon-box ${statusInfo.class}`}>
            <StatusIcon size={20} />
          </div>
          <div className="metric-tag">INTELLIGENT SYSTEM STATE</div>
        </div>
        <div className="metric-body">
          <div className="metric-number-row">
            <span className={`metric-status-text ${statusInfo.class}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="metric-subtext">
            {statusInfo.desc}
          </div>
        </div>
        <div className="metric-footer actuators-summary">
          <div className="actuator-item" title="Hardware Target: ESP32 GPIO 26 Relay 1">
            <span className="actuator-name">Pump (GPIO 26):</span>
            <span className={`actuator-val ${pump ? 'val-on' : 'val-off'}`}>
              {pump ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="actuator-item" title="Hardware Target: ESP32 GPIO 27 Relay 2">
            <span className="actuator-name">Valve (GPIO 27):</span>
            <span className={`actuator-val ${valve ? 'val-open' : 'val-closed'}`}>
              {valve ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="actuator-item">
            <span className="actuator-name">Auto-Cut:</span>
            <span className={`actuator-val ${autoShutoff ? 'val-enabled' : 'val-disabled'}`}>
              {autoShutoff ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

