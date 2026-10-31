import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Activity, Waves, Droplet, AlertTriangle } from 'lucide-react';
import { FlowDataPoint } from '../types/simulation';

interface FlowChartProps {
  history: FlowDataPoint[];
  threshold: number;
  flowDifference: number;
  leak: boolean;
  inletFlow: number;
  outletFlow: number;
}

export const FlowChart: React.FC<FlowChartProps> = ({
  history,
  threshold,
  flowDifference,
  leak,
  inletFlow,
  outletFlow,
}) => {
  // Fallback if history is empty
  const chartData = history.length > 0 ? history : [
    {
      time: '00:00',
      timestamp: Date.now(),
      inlet: 12.2,
      outlet: 12.0,
      difference: 0.2,
      leakActive: false,
      threshold: threshold,
    }
  ];

  return (
    <div className="panel chart-panel-card">
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Activity size={18} className="panel-header-icon" />
          <h2 className="panel-title">Real-Time Differential Flow Telemetry</h2>
        </div>
        <div className="chart-badges">
          <span className="live-telemetry-badge">
            <span className="live-dot" /> LIVE 1Hz STREAM
          </span>
          {leak && (
            <span className="leak-marker-badge">
              <AlertTriangle size={12} />
              LEAK ACTIVE (ΔQ: {flowDifference.toFixed(1)} L/m)
            </span>
          )}
        </div>
      </div>

      {/* Chart Visual Container */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 15, right: 18, left: -14, bottom: 5 }}
          >
            <defs>
              {/* Inlet Gradient (Blue) */}
              <linearGradient id="inletGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>

              {/* Outlet Gradient (Teal) */}
              <linearGradient id="outletGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>

              {/* Difference Gradient (Red / Alert) */}
              <linearGradient id="diffGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              minTickGap={20}
            />
            
            <YAxis 
              domain={[0, 18]} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              unit=" L/m"
            />

            <Tooltip 
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
              formatter={(value: any, name: any) => [`${Number(value).toFixed(2)} L/min`, name]}
            />

            <Legend 
              verticalAlign="top" 
              height={32}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
            />

            {/* Threshold Reference Line */}
            <ReferenceLine 
              y={threshold} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: `Trip Threshold: ${threshold.toFixed(1)} L/m`, 
                position: 'insideTopRight', 
                fill: '#dc2626', 
                fontSize: 10,
                fontWeight: 700 
              }} 
            />

            <Area 
              type="monotone" 
              dataKey="inlet" 
              name="Inlet Flow Sensor 1 (L/min)" 
              stroke="#0284c7" 
              fill="url(#inletGradient)" 
              strokeWidth={2.2} 
              isAnimationActive={false}
            />

            <Area 
              type="monotone" 
              dataKey="outlet" 
              name="Outlet Flow Sensor 2 (L/min)" 
              stroke="#0d9488" 
              fill="url(#outletGradient)" 
              strokeWidth={2.2} 
              isAnimationActive={false}
            />

            <Area 
              type="monotone" 
              dataKey="difference" 
              name="Flow Difference ΔQ (L/min)" 
              stroke="#ef4444" 
              fill="url(#diffGradient)" 
              strokeWidth={1.5} 
              strokeDasharray="2 2"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Stats */}
      <div className="chart-footer-metrics">
        <div className="chart-metric-chip">
          <span className="chip-label">Current Inlet:</span>
          <span className="chip-value blue-text">{inletFlow.toFixed(2)} L/min</span>
        </div>
        <div className="chart-metric-chip">
          <span className="chip-label">Current Outlet:</span>
          <span className="chip-value teal-text">{outletFlow.toFixed(2)} L/min</span>
        </div>
        <div className="chart-metric-chip">
          <span className="chip-label">Differential ΔQ:</span>
          <span className={`chip-value ${flowDifference >= threshold ? 'red-text' : 'green-text'}`}>
            {flowDifference.toFixed(2)} L/min
          </span>
        </div>
        <div className="chart-metric-chip">
          <span className="chip-label">Safety Margin:</span>
          <span className="chip-value">
            {flowDifference >= threshold 
              ? `EXCEEDED BY ${(flowDifference - threshold).toFixed(2)} L/m` 
              : `${(threshold - flowDifference).toFixed(2)} L/m below trip`}
          </span>
        </div>
      </div>
    </div>
  );
};

