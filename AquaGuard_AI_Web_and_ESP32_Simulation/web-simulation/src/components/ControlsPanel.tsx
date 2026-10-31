import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Droplet, 
  RotateCcw, 
  Sliders, 
  ShieldAlert, 
  Settings2, 
  ChevronDown, 
  ChevronUp,
  Power,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { SimulationConfig } from '../types/simulation';

interface ControlsPanelProps {
  running: boolean;
  pump: boolean;
  valve: boolean;
  leak: boolean;
  leakIntensity: number;
  autoShutoff: boolean;
  config: SimulationConfig;
  onStartFlow: () => void;
  onStopFlow: () => void;
  onToggleLeak: () => void;
  onUpdateLeakIntensity: (val: number) => void;
  onToggleAutoShutoff: () => void;
  onTogglePump: () => void;
  onToggleValve: () => void;
  onReset: () => void;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  running,
  pump,
  valve,
  leak,
  leakIntensity,
  autoShutoff,
  config,
  onStartFlow,
  onStopFlow,
  onToggleLeak,
  onUpdateLeakIntensity,
  onToggleAutoShutoff,
  onTogglePump,
  onToggleValve,
  onReset,
  onUpdateConfig,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="panel controls-panel-card">
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Sliders size={18} className="panel-header-icon" />
          <h2 className="panel-title">Operator Control Console</h2>
        </div>
        <button 
          className="settings-toggle-btn"
          onClick={() => setShowSettings(v => !v)}
          title="Configure detection thresholds and persistence timings"
        >
          <Settings2 size={15} />
          <span>{showSettings ? 'Hide Settings' : 'Settings & Calibration'}</span>
          {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="control-button-grid">
        <button 
          className="ctrl-btn btn-start" 
          onClick={onStartFlow}
          disabled={running && pump && valve}
        >
          <Play size={16} fill="currentColor" />
          <span>Start Flow</span>
        </button>

        <button 
          className="ctrl-btn btn-stop" 
          onClick={onStopFlow}
          disabled={!running && !pump}
        >
          <Square size={16} fill="currentColor" />
          <span>Stop Flow</span>
        </button>

        <button 
          className={`ctrl-btn btn-leak ${leak ? 'leak-active-btn' : ''}`} 
          onClick={onToggleLeak}
        >
          <Droplet size={16} fill={leak ? 'currentColor' : 'none'} />
          <span>{leak ? 'Remove Leak' : 'Inject Leak'}</span>
        </button>

        <button 
          className="ctrl-btn btn-reset" 
          onClick={onReset}
        >
          <RotateCcw size={16} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Leak Intensity Slider & Presets */}
      <div className="leak-intensity-box">
        <div className="slider-header-row">
          <label htmlFor="leak-slider" className="slider-label">
            Simulated Leak Loss Rate:
          </label>
          <div className="intensity-display-pill">
            <span className="intensity-value">{leakIntensity.toFixed(1)}</span>
            <span className="intensity-unit">L/min</span>
          </div>
        </div>

        <input 
          id="leak-slider"
          type="range"
          min="0.5"
          max="8.0"
          step="0.5"
          value={leakIntensity}
          onChange={(e) => onUpdateLeakIntensity(parseFloat(e.target.value))}
          className="range-input"
        />

        <div className="intensity-presets">
          <span className="presets-label">Quick Presets:</span>
          <button 
            type="button" 
            className={`preset-pill ${leakIntensity === 1.0 ? 'active' : ''}`}
            onClick={() => onUpdateLeakIntensity(1.0)}
          >
            Minor (1.0 L/m)
          </button>
          <button 
            type="button" 
            className={`preset-pill ${leakIntensity === 2.5 ? 'active' : ''}`}
            onClick={() => onUpdateLeakIntensity(2.5)}
          >
            Medium (2.5 L/m)
          </button>
          <button 
            type="button" 
            className={`preset-pill ${leakIntensity === 5.0 ? 'active' : ''}`}
            onClick={() => onUpdateLeakIntensity(5.0)}
          >
            Burst (5.0 L/m)
          </button>
        </div>
      </div>

      {/* Actuator Toggles and Automation Settings */}
      <div className="actuators-control-section">
        {/* Automatic Shutoff Toggle */}
        <div className="control-toggle-row">
          <div className="toggle-info">
            <div className="toggle-title-line">
              <ShieldAlert size={16} className={autoShutoff ? 'text-teal' : 'text-muted'} />
              <strong>Automatic Emergency Shutoff</strong>
            </div>
            <small>
              Automatically stops pump and closes valve when differential sustained &gt; {config.threshold} L/min for {config.persistenceSeconds}s.
            </small>
          </div>
          <button 
            type="button"
            className={`switch-toggle ${autoShutoff ? 'switch-on' : 'switch-off'}`}
            onClick={onToggleAutoShutoff}
            aria-label="Toggle Automatic Shutoff"
          >
            <span className="switch-thumb" />
          </button>
        </div>

        {/* Manual Pump Control */}
        <div className="control-toggle-row">
          <div className="toggle-info">
            <div className="toggle-title-line">
              <Power size={16} className={pump ? 'text-teal' : 'text-danger'} />
              <strong>Simulated Centrifugal Pump</strong>
            </div>
            <small>Simulated actuator override (Target Pin: ESP32 GPIO 26)</small>
          </div>
          <button 
            type="button"
            className={`actuator-btn ${pump ? 'btn-actuator-on' : 'btn-actuator-off'}`}
            onClick={onTogglePump}
          >
            {pump ? 'PUMP RUNNING' : 'PUMP STOPPED'}
          </button>
        </div>

        {/* Manual Valve Control */}
        <div className="control-toggle-row">
          <div className="toggle-info">
            <div className="toggle-title-line">
              <Sliders size={16} className={valve ? 'text-teal' : 'text-danger'} />
              <strong>Motorized Isolation Valve</strong>
            </div>
            <small>Simulated actuator override (Target Pin: ESP32 GPIO 27)</small>
          </div>
          <button 
            type="button"
            className={`actuator-btn ${valve ? 'btn-actuator-on' : 'btn-actuator-off'}`}
            onClick={onToggleValve}
          >
            {valve ? 'VALVE OPEN' : 'VALVE CLOSED'}
          </button>
        </div>
      </div>

      {/* Collapsible Settings Drawer */}
      {showSettings && (
        <div className="settings-drawer animate-slide-down">
          <div className="settings-drawer-header">
            <h4>Algorithm & Calibration Parameters</h4>
            <span className="calib-tag">Configurable IoT Heuristics</span>
          </div>

          <div className="settings-fields">
            {/* Threshold Setting */}
            <div className="setting-field">
              <div className="setting-field-header">
                <label>Differential Trip Threshold (ΔQ):</label>
                <strong>{config.threshold.toFixed(1)} L/min</strong>
              </div>
              <input 
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={config.threshold}
                onChange={(e) => onUpdateConfig({ threshold: parseFloat(e.target.value) })}
                className="range-input"
              />
              <span className="setting-hint">
                Default: 2.0 L/min. Lowering this increases sensitivity; higher values prevent false alarms in noisy pipes.
              </span>
            </div>

            {/* Persistence Setting */}
            <div className="setting-field">
              <div className="setting-field-header">
                <label>Persistence Duration Window:</label>
                <strong>{config.persistenceSeconds} Seconds</strong>
              </div>
              <input 
                type="range"
                min="1"
                max="8"
                step="1"
                value={config.persistenceSeconds}
                onChange={(e) => onUpdateConfig({ persistenceSeconds: parseInt(e.target.value, 10) })}
                className="range-input"
              />
              <span className="setting-hint">
                Default: 3s. Filtering out single-tick transient pulses (air bubbles, valve open surges).
              </span>
            </div>

            {/* Base Flow Rate */}
            <div className="setting-field">
              <div className="setting-field-header">
                <label>Nominal Upstream Flow Rate:</label>
                <strong>{config.baseFlowRate.toFixed(1)} L/min</strong>
              </div>
              <input 
                type="range"
                min="8.0"
                max="20.0"
                step="1.0"
                value={config.baseFlowRate}
                onChange={(e) => onUpdateConfig({ baseFlowRate: parseFloat(e.target.value) })}
                className="range-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

