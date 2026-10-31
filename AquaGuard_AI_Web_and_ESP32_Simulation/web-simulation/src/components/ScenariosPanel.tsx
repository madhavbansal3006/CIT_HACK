import React from 'react';
import { PlayCircle, CheckCircle, AlertTriangle, AlertOctagon, PowerOff, ShieldOff } from 'lucide-react';
import { ScenarioId } from '../types/simulation';

interface ScenariosPanelProps {
  activeScenario: ScenarioId | null;
  onRunScenario: (scenario: ScenarioId) => void;
}

interface ScenarioDef {
  id: ScenarioId;
  code: string;
  title: string;
  description: string;
  expectedOutcome: string;
  icon: React.ElementType;
  badgeClass: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'SCENARIO_A',
    code: 'Demo A',
    title: 'Normal Operating Flow',
    description: 'Steady baseline flow with nominal ±0.2 L/min sensor noise.',
    expectedOutcome: 'No alarm. Status remains NORMAL. Water safely delivered.',
    icon: CheckCircle,
    badgeClass: 'badge-normal',
  },
  {
    id: 'SCENARIO_B',
    code: 'Demo B',
    title: 'Discrepancy Below Threshold',
    description: 'Minor 1.1 L/min variance introduced (below the 2.0 L/min trip threshold).',
    expectedOutcome: 'Filters out false alarm! Persistence timer is NOT triggered.',
    icon: AlertTriangle,
    badgeClass: 'badge-info',
  },
  {
    id: 'SCENARIO_C',
    code: 'Demo C',
    title: 'Persistent Possible Leak',
    description: 'Moderate 3.2 L/min leak injected. Sustained difference exceeds threshold.',
    expectedOutcome: 'Timer counts 3s persistence, triggers AUTO SHUTOFF, halts pump & closes valve.',
    icon: AlertTriangle,
    badgeClass: 'badge-warn',
  },
  {
    id: 'SCENARIO_D',
    code: 'Demo D',
    title: 'Major Pipeline Fracture',
    description: 'Severe 5.8 L/min pipe burst simulation.',
    expectedOutcome: 'High differential trips emergency isolation protocol rapidly.',
    icon: AlertOctagon,
    badgeClass: 'badge-danger',
  },
  {
    id: 'SCENARIO_E',
    code: 'Demo E',
    title: 'Manual Pump Intervention',
    description: 'Operator manually stops pump without leak alarm.',
    expectedOutcome: 'Flow drops cleanly to zero. Verifies manual override handling.',
    icon: PowerOff,
    badgeClass: 'badge-neutral',
  },
  {
    id: 'SCENARIO_F',
    code: 'Demo F',
    title: 'Auto-Shutoff Disabled (Baseline Risk)',
    description: 'Leak injected while Automatic Shutoff protection is switched OFF.',
    expectedOutcome: 'Alarms sound but water continues wasting, highlighting the value of AquaGuard AI.',
    icon: ShieldOff,
    badgeClass: 'badge-danger',
  },
];

export const ScenariosPanel: React.FC<ScenariosPanelProps> = ({
  activeScenario,
  onRunScenario,
}) => {
  return (
    <div className="panel scenarios-panel-card">
      <div className="panel-header-row">
        <div className="panel-title-group">
          <PlayCircle size={18} className="panel-header-icon" />
          <h2 className="panel-title">Hackathon Judge Demonstration Scenarios</h2>
        </div>
        <span className="small-tag">1-Click Live Test Scenarios</span>
      </div>

      <div className="scenarios-grid">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = activeScenario === scenario.id;

          return (
            <div 
              key={scenario.id} 
              className={`scenario-card ${isActive ? 'scenario-active-card' : ''}`}
            >
              <div className="scenario-card-top">
                <span className={`scenario-code-badge ${scenario.badgeClass}`}>
                  {scenario.code}
                </span>
                <span className="scenario-icon-wrap">
                  <Icon size={16} />
                </span>
              </div>

              <h4 className="scenario-card-title">{scenario.title}</h4>
              <p className="scenario-card-desc">{scenario.description}</p>

              <div className="scenario-expected">
                <strong>Expected Behavior:</strong> {scenario.expectedOutcome}
              </div>

              <button 
                type="button"
                className={`run-scenario-btn ${isActive ? 'active-run-btn' : ''}`}
                onClick={() => onRunScenario(scenario.id)}
              >
                {isActive ? 'Currently Active' : 'Run Scenario'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

