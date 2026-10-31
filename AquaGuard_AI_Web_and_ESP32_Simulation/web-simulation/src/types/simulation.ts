export interface FlowDataPoint {
  time: string;
  timestamp: number;
  inlet: number;
  outlet: number;
  difference: number;
  leakActive: boolean;
  threshold: number;
}

export type EventCategory = 'info' | 'normal' | 'warn' | 'danger' | 'action';

export interface EventLogItem {
  id: string;
  time: string;
  message: string;
  category: EventCategory;
  details?: string;
}

export type SystemStatus = 
  | 'NORMAL' 
  | 'SUSPECTED_LEAK' 
  | 'AUTO_SHUTOFF' 
  | 'STOPPED' 
  | 'MANUAL_OVERRIDE';

export interface SimulationConfig {
  threshold: number;         // L/min difference threshold (default 2.0)
  persistenceSeconds: number;// Duration threshold must be exceeded (default 3.0)
  baseFlowRate: number;      // Nominal flow rate in L/min (default 12.2)
  sensorNoise: number;       // Sensor variance range in L/min (default 0.25)
}

export interface WaterMetrics {
  totalPumpedLiters: number;
  totalDeliveredLiters: number;
  totalLostLiters: number;
  totalConservedLiters: number;
}

export type ScenarioId = 
  | 'SCENARIO_A'  // Normal flow
  | 'SCENARIO_B'  // Discrepancy below threshold
  | 'SCENARIO_C'  // Persistent possible leak (trips auto-shutoff)
  | 'SCENARIO_D'  // Major simulated leak (sudden pipe burst)
  | 'SCENARIO_E'  // Manual pump stop
  | 'SCENARIO_F'; // Auto-shutoff disabled

