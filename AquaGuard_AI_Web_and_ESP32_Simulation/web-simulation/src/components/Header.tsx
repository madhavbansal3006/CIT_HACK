import React from 'react';
import { Droplets, RotateCcw, MonitorPlay, BookOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenEngineering: () => void;
  projectorMode: boolean;
  onToggleProjectorMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenEngineering,
  projectorMode,
  onToggleProjectorMode,
}) => {
  return (
    <header className="top-header">
      <div className="header-left">
        <div className="logo-badge">
          <Droplets className="logo-icon" size={28} />
          <div className="logo-pulse" />
        </div>
        <div className="title-group">
          <div className="category-tag">
            <span className="category-pill">C1 · SMARTER WATER CONSERVATION</span>
            <span className="team-pill">TEAM: IVISION</span>
          </div>
          <h1 className="main-title">
            AquaGuard <span className="title-accent">AI</span>
          </h1>
          <p className="main-subtitle">
            Water Leakage Detection and Automatic Shutoff System
          </p>
        </div>
      </div>

      <div className="header-right">
        <div className="simulation-badge" title="Telemetry and actuation are running in software simulation">
          <span className="sim-pulse-dot" />
          <span className="sim-label">SIMULATION MODE</span>
          <span className="sim-sub">IoT Virtual Model</span>
        </div>

        <button 
          className="header-btn"
          onClick={onOpenEngineering}
          title="IoT Calibration, Differential Principles & Physical Hardware Specs"
        >
          <BookOpen size={16} />
          <span>IoT Engineering</span>
        </button>

        <button 
          className={`header-btn ${projectorMode ? 'active' : ''}`}
          onClick={onToggleProjectorMode}
          title="Toggle High-Contrast Hackathon Projector Mode"
        >
          <MonitorPlay size={16} />
          <span>Projector Mode</span>
        </button>

        <button 
          className="header-btn reset-btn"
          onClick={onReset}
          title="Reset simulation to initial state"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};

