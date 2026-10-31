import React, { useState } from 'react';
import { useWaterSimulation } from './hooks/useWaterSimulation';
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { MetricsGrid } from './components/MetricsGrid';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ControlsPanel } from './components/ControlsPanel';
import { FlowChart } from './components/FlowChart';
import { WaterConservationStats } from './components/WaterConservationStats';
import { ScenariosPanel } from './components/ScenariosPanel';
import { EventLogPanel } from './components/EventLogPanel';
import { EngineeringModal } from './components/EngineeringModal';

export default function App() {
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [engineeringModalOpen, setEngineeringModalOpen] = useState<boolean>(false);

  const {
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
    startFlow,
    stopFlow,
    toggleLeak,
    updateLeakIntensity,
    toggleAutoShutoff,
    togglePump,
    toggleValve,
    updateConfig,
    resetSimulation,
    clearEvents,
    runScenario,
  } = useWaterSimulation();

  return (
    <div className={`app-container ${projectorMode ? 'projector-mode' : ''}`}>
      {/* Top Application Bar */}
      <Header
        onReset={resetSimulation}
        onOpenEngineering={() => setEngineeringModalOpen(true)}
        projectorMode={projectorMode}
        onToggleProjectorMode={() => setProjectorMode(prev => !prev)}
      />

      <main className="main-content">
        {/* Important Simulation Notice Banner */}
        <NoticeBanner onOpenEngineering={() => setEngineeringModalOpen(true)} />

        {/* 1. Key Telemetry Metrics Grid */}
        <MetricsGrid
          inletFlow={inletFlow}
          outletFlow={outletFlow}
          flowDifference={flowDifference}
          threshold={config.threshold}
          persistenceCounter={persistenceCounter}
          persistenceRequired={config.persistenceSeconds}
          systemStatus={systemStatus}
          pump={pump}
          valve={valve}
          autoShutoff={autoShutoff}
          running={running}
        />

        {/* 2. Interactive Animated Pipeline Visualizer */}
        <PipelineVisualizer
          running={running}
          pump={pump}
          valve={valve}
          leak={leak}
          leakIntensity={leakIntensity}
          inletFlow={inletFlow}
          outletFlow={outletFlow}
          systemStatus={systemStatus}
          onToggleLeak={toggleLeak}
        />

        {/* 3. Controls Console and Live Telemetry Chart */}
        <div className="middle-dashboard-grid">
          <ControlsPanel
            running={running}
            pump={pump}
            valve={valve}
            leak={leak}
            leakIntensity={leakIntensity}
            autoShutoff={autoShutoff}
            config={config}
            onStartFlow={startFlow}
            onStopFlow={stopFlow}
            onToggleLeak={toggleLeak}
            onUpdateLeakIntensity={updateLeakIntensity}
            onToggleAutoShutoff={toggleAutoShutoff}
            onTogglePump={togglePump}
            onToggleValve={toggleValve}
            onReset={resetSimulation}
            onUpdateConfig={updateConfig}
          />

          <FlowChart
            history={history}
            threshold={config.threshold}
            flowDifference={flowDifference}
            leak={leak}
            inletFlow={inletFlow}
            outletFlow={outletFlow}
          />
        </div>

        {/* 4. Water Conservation Analytics for Category C1 */}
        <WaterConservationStats metrics={metrics} />

        {/* 5. Judge Demo Scenarios & Audit Trail Event Log */}
        <div className="lower-dashboard-grid">
          <ScenariosPanel
            activeScenario={activeScenario}
            onRunScenario={runScenario}
          />

          <EventLogPanel
            events={events}
            onClearEvents={clearEvents}
          />
        </div>

        {/* Application Footer */}
        <footer className="app-footer">
          <div className="footer-left">
            <strong>AquaGuard AI</strong> · Team IVISION · Category C1: Smarter Water Conservation
          </div>
          <div className="footer-right">
            <span>Prototype IoT Simulation System · Completely decoupled from physical JalDrishti sensors</span>
          </div>
        </footer>
      </main>

      {/* IoT Engineering & Calibration Modal */}
      <EngineeringModal
        isOpen={engineeringModalOpen}
        onClose={() => setEngineeringModalOpen(false)}
      />
    </div>
  );
}
