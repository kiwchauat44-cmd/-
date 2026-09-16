import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { SettingsTab } from './components/SettingsTab';
import { ExperimentTab } from './components/ExperimentTab';
import { ResultsTab } from './components/ResultsTab';
import { ModelInfoTab } from './components/ModelInfoTab';
import { CivilizationBottomSheet } from './components/CivilizationBottomSheet';
import { SimulationEngine } from './simulation/engine';
import { Civilization, Galaxy, Star, SimulationParams, SimulationStats } from './types/simulation';
import { downloadStandaloneHtml } from './utils/exportStandaloneHtml';

const DEFAULT_PARAMS: SimulationParams = {
  civCount: 10000,
  minDistance: 10,
  maxDistance: 100000,
  minLifetime: 1000,
  maxLifetime: 1000000,
  techGrowthRate: 0.01,
  techModel: 'logistic',
  signalLifetime: 10000,
  signalStrength: 0.8,
  directionality: 0.3,
  detectorSensitivity: 0.5,
  simulationEpoch: 5000000,
  seed: 42,
  distribution: 'galactic_disk',
  // 3D Universe & Search parameters
  galaxyCount: 8,
  starsPerGalaxy: 1500,
  searchRounds: 4,
  searchStrategy: 'radial',
  galaxyCoverage: 'all_galaxies',
  signalSpeedMultiplier: 1.0,
  civilizationEvolutionRate: 0.05,
  civilizationCollapseProbability: 0.15
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('experiment');
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [civilizations, setCivilizations] = useState<Civilization[]>([]);
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressCount, setProgressCount] = useState<number>(0);
  const [selectedCiv, setSelectedCiv] = useState<Civilization | null>(null);

  const engineRef = useRef<SimulationEngine>(new SimulationEngine());

  // Run Simulation with asynchronous chunking
  const runSimulation = useCallback(async (customParams?: SimulationParams) => {
    if (isRunning) return;

    const runParams = customParams || params;
    setIsRunning(true);
    setProgressPercent(0);
    setProgressCount(0);

    const engine = new SimulationEngine();
    engineRef.current = engine;

    try {
      const result = await engine.runSimulation(
        runParams,
        (completed, total, percentage) => {
          setProgressPercent(percentage);
          setProgressCount(completed);
        }
      );

      setCivilizations(result.civilizations);
      if (result.galaxies) setGalaxies(result.galaxies);
      if (result.stars) setStars(result.stars);
      setStats(result.stats);
      setProgressPercent(100);
      setProgressCount(runParams.civCount);
    } catch (err: any) {
      if (err?.message !== 'Simulation cancelled by user') {
        console.error('Simulation execution error:', err);
      }
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, params]);

  // Initial auto-run on first load
  useEffect(() => {
    runSimulation(DEFAULT_PARAMS);
  }, []);

  const handleStopSimulation = () => {
    engineRef.current.cancel();
    setIsRunning(false);
  };

  const handleResetDefaults = () => {
    handleStopSimulation();
    setParams(DEFAULT_PARAMS);
    runSimulation(DEFAULT_PARAMS);
  };

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000) + 1;
    const updated = { ...params, seed: newSeed };
    setParams(updated);
  };

  const handleRandomizeSeedAndRun = () => {
    const newSeed = Math.floor(Math.random() * 1000000) + 1;
    const updated = { ...params, seed: newSeed };
    setParams(updated);
    runSimulation(updated);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        stats={stats}
        isRunning={isRunning}
        onDownloadStandalone={() => downloadStandaloneHtml(params)}
        onReset={handleResetDefaults}
      />

      {/* Navigation (Sticky Mobile Tabs) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        detectedCount={stats?.detectedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {activeTab === 'settings' && (
          <SettingsTab
            params={params}
            onUpdateParams={(newParams) => setParams(newParams)}
            onStartSimulation={() => {
              setActiveTab('experiment');
              runSimulation(params);
            }}
            onResetDefaults={handleResetDefaults}
            onRandomizeSeed={handleRandomizeSeed}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'experiment' && (
          <ExperimentTab
            civilizations={civilizations}
            galaxies={galaxies}
            stars={stars}
            stats={stats}
            params={params}
            isRunning={isRunning}
            progressPercent={progressPercent}
            progressCount={progressCount}
            onStartSimulation={() => runSimulation()}
            onStopSimulation={handleStopSimulation}
            onResetSimulation={handleResetDefaults}
            onRandomizeSeedAndRun={handleRandomizeSeedAndRun}
            onSelectCivilization={(civ) => setSelectedCiv(civ)}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab
            stats={stats}
            params={params}
            onRunSimulation={() => {
              setActiveTab('experiment');
              runSimulation(params);
            }}
          />
        )}

        {activeTab === 'info' && <ModelInfoTab />}
      </main>

      {/* Civilization Detail Bottom Sheet */}
      <CivilizationBottomSheet
        civilization={selectedCiv}
        onClose={() => setSelectedCiv(null)}
      />
    </div>
  );
}

export default App;
