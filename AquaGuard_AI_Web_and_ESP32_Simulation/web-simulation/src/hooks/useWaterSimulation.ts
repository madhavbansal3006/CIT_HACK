import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FlowDataPoint, 
  EventLogItem, 
  SystemStatus, 
  SimulationConfig, 
  WaterMetrics, 
  ScenarioId, 
  EventCategory 
} from '../types/simulation';

const DEFAULT_CONFIG: SimulationConfig = {
  threshold: 2.0,           // 2.0 L/min default illustrative threshold
  persistenceSeconds: 3,    // 3 seconds persistence check
  baseFlowRate: 12.2,       // ~12.2 L/min nominal rate
  sensorNoise: 0.28,        // ±0.28 L/min sensor noise
};

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function useWaterSimulation() {
  // Operational States
  const [running, setRunning] = useState<boolean>(true);
  const [pump, setPump] = useState<boolean>(true);
  const [valve, setValve] = useState<boolean>(true);
  const [leak, setLeak] = useState<boolean>(false);
  const [leakIntensity, setLeakIntensity] = useState<number>(3.0);
  const [autoShutoff, setAutoShutoff] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null);

  // Configuration
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);

  // Live telemetry readings
  const [inletFlow, setInletFlow] = useState<number>(12.3);
  const [outletFlow, setOutletFlow] = useState<number>(12.1);
  const [flowDifference, setFlowDifference] = useState<number>(0.2);
  const [persistenceCounter, setPersistenceCounter] = useState<number>(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('NORMAL');

  // Conservation Metrics (Clean 0.0 baseline on startup)
  const [metrics, setMetrics] = useState<WaterMetrics>({
    totalPumpedLiters: 0.0,
    totalDeliveredLiters: 0.0,
    totalLostLiters: 0.0,
    totalConservedLiters: 0.0,
  });

  // History buffer for Recharts
  const [history, setHistory] = useState<FlowDataPoint[]>([]);

  // Event Log
  const [events, setEvents] = useState<EventLogItem[]>([
    {
      id: 'init-1',
      time: getTimestamp(),
      message: 'AquaGuard AI simulation engine initialized in SIMULATION MODE.',
      category: 'info',
      details: 'All telemetry readings are generated in software for algorithm demonstration.',
    },
    {
      id: 'init-2',
      time: getTimestamp(),
      message: 'Normal pipeline flow established — pump active, motorized valve open.',
      category: 'normal',
    }
  ]);

  // Ref to track state in the tick loop without closure staleness
  const stateRef = useRef({
    running,
    pump,
    valve,
    leak,
    leakIntensity,
    autoShutoff,
    config,
    persistenceCounter,
    systemStatus,
  });

  // Keep ref synchronized
  useEffect(() => {
    stateRef.current = {
      running,
      pump,
      valve,
      leak,
      leakIntensity,
      autoShutoff,
      config,
      persistenceCounter,
      systemStatus,
    };
  }, [running, pump, valve, leak, leakIntensity, autoShutoff, config, persistenceCounter, systemStatus]);

  // Event logger helper
  const logEvent = useCallback((message: string, category: EventCategory, details?: string) => {
    const newItem: EventLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      time: getTimestamp(),
      message,
      category,
      details,
    };
    setEvents(prev => [newItem, ...prev].slice(0, 60));
  }, []);

  // Main simulation tick (runs once per second)
  useEffect(() => {
    const timer = setInterval(() => {
      const state = stateRef.current;
      const { 
        running: isRunning, 
        pump: isPumpOn, 
        valve: isValveOpen, 
        leak: isLeakActive, 
        leakIntensity: intensity, 
        autoShutoff: isAutoShutoff, 
        config: currentConfig 
      } = state;

      // Calculate instantaneous Inlet Flow
      let currentInlet = 0;
      if (isRunning && isPumpOn) {
        const noise = (Math.random() - 0.5) * currentConfig.sensorNoise * 2;
        currentInlet = Math.max(0, +(currentConfig.baseFlowRate + noise).toFixed(2));
      }

      // Calculate instantaneous Outlet Flow
      let currentOutlet = 0;
      if (isRunning && isPumpOn && isValveOpen) {
        const loss = isLeakActive ? intensity : 0;
        const noise = (Math.random() - 0.5) * currentConfig.sensorNoise * 1.8;
        currentOutlet = Math.max(0, +(currentConfig.baseFlowRate - loss + noise).toFixed(2));
      }

      // Differential Calculation: deltaQ = inlet - outlet
      const diff = isRunning && isPumpOn 
        ? Math.max(0, +(currentInlet - currentOutlet).toFixed(2)) 
        : 0;

      setInletFlow(currentInlet);
      setOutletFlow(currentOutlet);
      setFlowDifference(diff);

      // Persistence & Detection Logic
      const isThresholdViolated = isRunning && isPumpOn && isValveOpen && diff >= currentConfig.threshold;

      if (isThresholdViolated) {
        const nextPersistence = state.persistenceCounter + 1;
        setPersistenceCounter(nextPersistence);

        if (nextPersistence === 1) {
          logEvent(
            `Flow difference alert: ΔQ = ${diff.toFixed(2)} L/min exceeds threshold (${currentConfig.threshold.toFixed(1)} L/min)`,
            'warn',
            'Persistence timer initiated to filter out momentary sensor jitter and water hammer.'
          );
          setSystemStatus('SUSPECTED_LEAK');
        }

        // Check if sustained period reached
        if (nextPersistence >= currentConfig.persistenceSeconds) {
          if (isAutoShutoff && state.systemStatus !== 'AUTO_SHUTOFF') {
            // AUTOMATIC SHUTOFF ACTION
            setPump(false);
            setValve(false);
            setRunning(false);
            setSystemStatus('AUTO_SHUTOFF');

            logEvent(
              `AUTOMATIC SHUTOFF TRIGGERED — Leak detected for ${nextPersistence}s`,
              'danger',
              `Differential of ${diff.toFixed(2)} L/min sustained over ${currentConfig.persistenceSeconds}s threshold. Pump halted and valve isolated.`
            );
            logEvent('Safety Protocol: Simulated Centrifugal Pump turned OFF', 'action');
            logEvent('Safety Protocol: Simulated Motorized Valve CLOSED', 'action');
          } else if (!isAutoShutoff) {
            setSystemStatus('SUSPECTED_LEAK');
            // Log periodically if leak continues without auto-shutoff
            if (nextPersistence % 5 === 0) {
              logEvent(
                `Unmitigated leak: ΔQ = ${diff.toFixed(2)} L/min persisting (${nextPersistence}s). Auto-shutoff is OFF!`,
                'danger',
                'Water wastage ongoing. Enable Auto-Shutoff or manually isolate the line.'
              );
            }
          }
        }
      } else {
        // Condition within threshold or flow stopped
        if (state.persistenceCounter > 0) {
          setPersistenceCounter(0);
          if (state.systemStatus === 'SUSPECTED_LEAK') {
            setSystemStatus('NORMAL');
            logEvent('Flow differential normalized below threshold. Status restored to NORMAL.', 'normal');
          }
        } else if (state.systemStatus !== 'AUTO_SHUTOFF') {
          if (!isPumpOn) {
            if (state.systemStatus !== 'STOPPED') setSystemStatus('STOPPED');
          } else if (!isValveOpen || !isRunning) {
            if (state.systemStatus !== 'MANUAL_OVERRIDE') setSystemStatus('MANUAL_OVERRIDE');
          } else {
            if (state.systemStatus !== 'NORMAL') setSystemStatus('NORMAL');
          }
        }
      }

      // Conservation Metrics Accumulation
      setMetrics(prev => {
        const pumped = currentInlet > 0 ? (currentInlet / 60) : 0;
        const delivered = currentOutlet > 0 ? (currentOutlet / 60) : 0;
        const lost = (isLeakActive && isRunning && isPumpOn) 
          ? Math.min(currentInlet, intensity) / 60 
          : 0;
        
        // Water conserved: if shutoff occurred during an active leak condition
        const conserved = (state.systemStatus === 'AUTO_SHUTOFF' && isLeakActive)
          ? (intensity / 60)
          : 0;

        return {
          totalPumpedLiters: +(prev.totalPumpedLiters + pumped).toFixed(2),
          totalDeliveredLiters: +(prev.totalDeliveredLiters + delivered).toFixed(2),
          totalLostLiters: +(prev.totalLostLiters + lost).toFixed(2),
          totalConservedLiters: +(prev.totalConservedLiters + conserved).toFixed(2),
        };
      });

      // Update Time-Series History
      setHistory(prev => {
        const point: FlowDataPoint = {
          time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          timestamp: Date.now(),
          inlet: currentInlet,
          outlet: currentOutlet,
          difference: diff,
          leakActive: isLeakActive,
          threshold: currentConfig.threshold,
        };
        return [...prev, point].slice(-35); // Keep rolling window
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [logEvent]);

  // Public Control Handlers
  const startFlow = useCallback(() => {
    setRunning(true);
    setPump(true);
    setValve(true);
    setPersistenceCounter(0);
    setSystemStatus('NORMAL');
    stateRef.current.running = true;
    stateRef.current.pump = true;
    stateRef.current.valve = true;
    stateRef.current.persistenceCounter = 0;
    stateRef.current.systemStatus = 'NORMAL';
    logEvent('Flow manually started: Pump set to ON, Valve set to OPEN.', 'action');
  }, [logEvent]);

  const stopFlow = useCallback(() => {
    setRunning(false);
    setPump(false);
    setPersistenceCounter(0);
    setSystemStatus('STOPPED');
    stateRef.current.running = false;
    stateRef.current.pump = false;
    stateRef.current.persistenceCounter = 0;
    stateRef.current.systemStatus = 'STOPPED';
    logEvent('Flow manually stopped: Pump halted by operator.', 'action');
  }, [logEvent]);

  const toggleLeak = useCallback(() => {
    setLeak(prev => {
      const next = !prev;
      stateRef.current.leak = next;
      if (next) {
        logEvent(
          `Simulated leak INJECTED (${stateRef.current.leakIntensity.toFixed(1)} L/min loss rate)`,
          'warn',
          'Simulated pipeline breach created between Flow Sensor 1 and Flow Sensor 2.'
        );
      } else {
        logEvent('Simulated leak REMOVED. Pipeline sealed.', 'normal');
        setPersistenceCounter(0);
        stateRef.current.persistenceCounter = 0;
        if (stateRef.current.systemStatus === 'SUSPECTED_LEAK') {
          setSystemStatus('NORMAL');
          stateRef.current.systemStatus = 'NORMAL';
        }
      }
      return next;
    });
  }, [logEvent]);

  const injectLeak = useCallback(() => {
    setLeak(true);
    stateRef.current.leak = true;
    logEvent(`Simulated leak INJECTED (${stateRef.current.leakIntensity.toFixed(1)} L/min)`, 'warn');
  }, [logEvent]);

  const removeLeak = useCallback(() => {
    setLeak(false);
    stateRef.current.leak = false;
    setPersistenceCounter(0);
    stateRef.current.persistenceCounter = 0;
    if (stateRef.current.systemStatus === 'SUSPECTED_LEAK') {
      setSystemStatus('NORMAL');
      stateRef.current.systemStatus = 'NORMAL';
    }
    logEvent('Simulated leak REMOVED', 'normal');
  }, [logEvent]);

  const updateLeakIntensity = useCallback((val: number) => {
    setLeakIntensity(val);
    stateRef.current.leakIntensity = val;
  }, []);

  const toggleAutoShutoff = useCallback(() => {
    setAutoShutoff(prev => {
      const next = !prev;
      stateRef.current.autoShutoff = next;
      logEvent(
        `Automatic Shutoff protection ${next ? 'ENABLED' : 'DISABLED'}`,
        next ? 'normal' : 'warn',
        next ? 'System will automatically halt pump and close valve upon sustained leak.' : 'System will only raise alerts; no automatic valve or pump action will take place.'
      );
      return next;
    });
  }, [logEvent]);

  const togglePump = useCallback(() => {
    setPump(prev => {
      const next = !prev;
      stateRef.current.pump = next;
      if (next) {
        setRunning(true);
        stateRef.current.running = true;
        const newStatus = stateRef.current.valve ? 'NORMAL' : 'MANUAL_OVERRIDE';
        setSystemStatus(newStatus);
        stateRef.current.systemStatus = newStatus;
      } else {
        setSystemStatus('STOPPED');
        stateRef.current.systemStatus = 'STOPPED';
      }
      logEvent(`Manual pump override: Pump turned ${next ? 'ON' : 'OFF'}`, 'action');
      return next;
    });
  }, [logEvent]);

  const toggleValve = useCallback(() => {
    setValve(prev => {
      const next = !prev;
      stateRef.current.valve = next;
      if (next) {
        const newStatus = stateRef.current.pump ? 'NORMAL' : 'STOPPED';
        setSystemStatus(newStatus);
        stateRef.current.systemStatus = newStatus;
      } else {
        const newStatus = stateRef.current.systemStatus === 'AUTO_SHUTOFF' ? 'AUTO_SHUTOFF' : 'MANUAL_OVERRIDE';
        setSystemStatus(newStatus);
        stateRef.current.systemStatus = newStatus;
      }
      logEvent(`Manual valve override: Valve set to ${next ? 'OPEN' : 'CLOSED'}`, 'action');
      return next;
    });
  }, [logEvent]);

  const updateConfig = useCallback((newConfig: Partial<SimulationConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      stateRef.current.config = updated;
      logEvent(
        `Simulation parameters updated: Threshold=${updated.threshold} L/min, Persistence=${updated.persistenceSeconds}s`,
        'info'
      );
      return updated;
    });
  }, [logEvent]);

  const resetSimulation = useCallback(() => {
    setRunning(true);
    setPump(true);
    setValve(true);
    setLeak(false);
    setLeakIntensity(3.0);
    setAutoShutoff(true);
    setActiveScenario(null);
    setInletFlow(12.3);
    setOutletFlow(12.1);
    setFlowDifference(0.2);
    setPersistenceCounter(0);
    setSystemStatus('NORMAL');
    setConfig(DEFAULT_CONFIG);
    setMetrics({
      totalPumpedLiters: 0.0,
      totalDeliveredLiters: 0.0,
      totalLostLiters: 0.0,
      totalConservedLiters: 0.0,
    });
    setHistory([]);
    stateRef.current = {
      running: true,
      pump: true,
      valve: true,
      leak: false,
      leakIntensity: 3.0,
      autoShutoff: true,
      config: DEFAULT_CONFIG,
      persistenceCounter: 0,
      systemStatus: 'NORMAL',
    };
    setEvents([
      {
        id: `reset-${Date.now()}`,
        time: getTimestamp(),
        message: 'Simulation reset — system restored to normal baseline operating parameters.',
        category: 'normal',
      }
    ]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Preset Scenario Runner for hackathon demonstration
  const runScenario = useCallback((scenario: ScenarioId) => {
    setActiveScenario(scenario);
    setPersistenceCounter(0);
    stateRef.current.persistenceCounter = 0;
    setSystemStatus('NORMAL');
    stateRef.current.systemStatus = 'NORMAL';

    switch (scenario) {
      case 'SCENARIO_A': // Normal Flow
        setRunning(true);
        setPump(true);
        setValve(true);
        setLeak(false);
        setLeakIntensity(3.0);
        setAutoShutoff(true);
        stateRef.current.running = true;
        stateRef.current.pump = true;
        stateRef.current.valve = true;
        stateRef.current.leak = false;
        stateRef.current.leakIntensity = 3.0;
        stateRef.current.autoShutoff = true;
        logEvent('Demonstration Scenario A: Normal Operating Flow (ΔQ < 0.3 L/min, within threshold)', 'normal');
        break;

      case 'SCENARIO_B': // Discrepancy Below Threshold
        setRunning(true);
        setPump(true);
        setValve(true);
        setLeak(true);
        setLeakIntensity(1.1); // 1.1 L/min is below default 2.0 L/min threshold
        setAutoShutoff(true);
        stateRef.current.running = true;
        stateRef.current.pump = true;
        stateRef.current.valve = true;
        stateRef.current.leak = true;
        stateRef.current.leakIntensity = 1.1;
        stateRef.current.autoShutoff = true;
        logEvent('Demonstration Scenario B: Small discrepancy (1.1 L/min) below threshold (2.0 L/min). Proves false-trip rejection.', 'info');
        break;

      case 'SCENARIO_C': // Persistent Leak & Auto-Shutoff
        setRunning(true);
        setPump(true);
        setValve(true);
        setLeak(true);
        setLeakIntensity(3.2); // 3.2 L/min exceeds 2.0 L/min
        setAutoShutoff(true);
        stateRef.current.running = true;
        stateRef.current.pump = true;
        stateRef.current.valve = true;
        stateRef.current.leak = true;
        stateRef.current.leakIntensity = 3.2;
        stateRef.current.autoShutoff = true;
        logEvent('Demonstration Scenario C: Persistent Leak (3.2 L/min). Timer will persist 3 seconds before auto-shutoff.', 'warn');
        break;

      case 'SCENARIO_D': // Major Pipe Burst
        setRunning(true);
        setPump(true);
        setValve(true);
        setLeak(true);
        setLeakIntensity(5.8); // 5.8 L/min severe fracture
        setAutoShutoff(true);
        stateRef.current.running = true;
        stateRef.current.pump = true;
        stateRef.current.valve = true;
        stateRef.current.leak = true;
        stateRef.current.leakIntensity = 5.8;
        stateRef.current.autoShutoff = true;
        logEvent('Demonstration Scenario D: Major simulated pipe fracture (5.8 L/min differential). Critical response test.', 'danger');
        break;

      case 'SCENARIO_E': // Manual Pump Stop
        setRunning(false);
        setPump(false);
        setValve(true);
        setLeak(false);
        setAutoShutoff(true);
        setSystemStatus('STOPPED');
        stateRef.current.running = false;
        stateRef.current.pump = false;
        stateRef.current.valve = true;
        stateRef.current.leak = false;
        stateRef.current.autoShutoff = true;
        stateRef.current.systemStatus = 'STOPPED';
        logEvent('Demonstration Scenario E: Manual operator pump stop. Safe zero-flow condition.', 'action');
        break;

      case 'SCENARIO_F': // Auto Shutoff Disabled
        setRunning(true);
        setPump(true);
        setValve(true);
        setLeak(true);
        setLeakIntensity(3.5);
        setAutoShutoff(false);
        stateRef.current.running = true;
        stateRef.current.pump = true;
        stateRef.current.valve = true;
        stateRef.current.leak = true;
        stateRef.current.leakIntensity = 3.5;
        stateRef.current.autoShutoff = false;
        logEvent('Demonstration Scenario F: Leak active with Auto-Shutoff DISABLED. Warning raised but water continues wasting.', 'warn');
        break;
    }
  }, [logEvent]);

  return {
    // States
    running,
    pump,
    valve,
    leak,
    leakIntensity,
    autoShutoff,
    activeScenario,
    config,
    inletFlow,
    outletFlow,
    flowDifference,
    persistenceCounter,
    systemStatus,
    metrics,
    history,
    events,

    // Actions
    startFlow,
    stopFlow,
    toggleLeak,
    injectLeak,
    removeLeak,
    updateLeakIntensity,
    toggleAutoShutoff,
    togglePump,
    toggleValve,
    updateConfig,
    resetSimulation,
    clearEvents,
    runScenario,
    logEvent,
  };
}

