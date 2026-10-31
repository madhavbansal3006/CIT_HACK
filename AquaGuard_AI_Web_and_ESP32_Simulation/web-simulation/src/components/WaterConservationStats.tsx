import React from 'react';
import { Droplet, Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { WaterMetrics } from '../types/simulation';

interface WaterConservationStatsProps {
  metrics: WaterMetrics;
}

export const WaterConservationStats: React.FC<WaterConservationStatsProps> = ({ metrics }) => {
  const efficiency = metrics.totalPumpedLiters > 0
    ? Math.max(0, Math.min(100, Math.round((metrics.totalDeliveredLiters / metrics.totalPumpedLiters) * 100)))
    : 100;

  return (
    <div className="water-conservation-card">
      <div className="conservation-header">
        <div className="conservation-title">
          <Award size={18} className="award-icon" />
          <h3>C1 · Smarter Water Conservation Impact Analytics</h3>
        </div>
        <span className="efficiency-badge">
          System Delivery Efficiency: <strong>{efficiency}%</strong>
        </span>
      </div>

      <div className="conservation-metrics-grid">
        <div className="cons-stat-item">
          <span className="cons-stat-label">Total Water Pumped</span>
          <span className="cons-stat-val text-blue">
            {metrics.totalPumpedLiters.toFixed(1)} <small>L</small>
          </span>
          <span className="cons-stat-sub">Gross intake from reservoir</span>
        </div>

        <div className="cons-stat-item">
          <span className="cons-stat-label">Delivered Downstream</span>
          <span className="cons-stat-val text-teal">
            {metrics.totalDeliveredLiters.toFixed(1)} <small>L</small>
          </span>
          <span className="cons-stat-sub">Safely reached destination</span>
        </div>

        <div className="cons-stat-item">
          <span className="cons-stat-label">Water Lost in Leak</span>
          <span className="cons-stat-val text-danger">
            {metrics.totalLostLiters.toFixed(1)} <small>L</small>
          </span>
          <span className="cons-stat-sub">Volume escaped before shutoff</span>
        </div>

        <div className="cons-stat-item highlight-conserved">
          <span className="cons-stat-label">Conserved by Auto-Shutoff</span>
          <span className="cons-stat-val text-emerald">
            {metrics.totalConservedLiters.toFixed(1)} <small>L</small>
          </span>
          <span className="cons-stat-sub">Projected wastage prevented</span>
        </div>
      </div>

      <div className="conservation-audit-footer">
        <span><b>Fluid Mass Balance:</b> Pumped ({metrics.totalPumpedLiters.toFixed(1)} L) ≈ Delivered ({metrics.totalDeliveredLiters.toFixed(1)} L) + Escaped Loss ({metrics.totalLostLiters.toFixed(1)} L)</span>
        <span className="audit-note"><b>* Accounting Audit:</b> "Conserved Volume" represents prospective loss avoided while halted in AUTO SHUTOFF (not drawn from source reservoir; never double-counted).</span>
      </div>
    </div>
  );
};

