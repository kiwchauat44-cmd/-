/**
 * Simulation Types and Data Models for SETI Temporal Mismatch & 3D Universe
 */

export type TechModelType = 'linear' | 'exponential' | 'logistic';

export type DistributionType = 'uniform' | 'galactic_disk' | 'cluster';

export type SearchStrategy = 'radial' | 'galaxy_sweep' | 'spiral' | 'random' | 'targeted' | 'full_coverage';

export type GalaxyCoverage = 'milky_way' | 'nearby_galaxies' | 'all_galaxies' | 'full_universe';

export type GalaxyType = 'spiral' | 'elliptical' | 'irregular';

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

export type CivCurrentState =
  | 'not_born'
  | 'developing'
  | 'active'
  | 'collapsed'
  | 'evolved'
  | 'undetectable'
  | 'unknown';

export type CivObservedState =
  | 'not_reached'
  | 'active'
  | 'extinct_visible'
  | 'signal_passed'
  | 'transcended'
  | 'undetectable';

export type TechnosignatureType =
  | 'radio_signal'
  | 'directed_beam'
  | 'high_energy'
  | 'low_detectability'
  | 'no_detectable_signal';

export interface Galaxy {
  id: string;
  name: string;
  type: GalaxyType;
  position: { x: number; y: number; z: number }; // scaled coordinates
  distanceFromEarth: number; // light years
  size: number; // radius in light years
  starCount: number;
  age: number; // billion years
  civCount: number;
  isMilkyWay: boolean;
}

export interface Star {
  id: string;
  galaxyId: string;
  name: string;
  position: { x: number; y: number; z: number };
  distanceFromEarth: number;
  mass: number; // solar masses
  age: number; // million years
  spectralClass: SpectralClass;
  planetsCount: number;
  habitableProbability: number;
  civProbability: number;
  hasCivilization: boolean;
  civId?: number;
}

export interface Civilization {
  id: number;
  name: string;
  galaxyId: string;
  galaxyName: string;
  starId: string;
  starName: string;
  position: { x: number; y: number; z: number };
  distance: number; // light years (ly) from Earth
  angle: number; // radians in galactic plane
  z: number; // vertical height (-1 to 1)
  
  birthTime: number; // year of origin in universe timeline
  civilizationAge: number; // current age at currentTime (years)
  civilizationLifetime: number; // total lifetime until collapse/transition (years)
  technologyLevel: number; // current tech level [0, 1]
  technologyGrowthRate: number; // k
  signalStrength: number; // [0, 1]
  signalLifetime: number; // duration of detectable emissions (years)
  communicationRange: number; // effective range (ly)
  directionality: number; // [0, 1] beaming factor
  lightTravelTime: number; // tau = distance / c (years)
  
  // Statuses
  currentState: CivCurrentState;
  observedState: CivObservedState;
  evolutionStage: string;
  technosignatureType: TechnosignatureType;
  collapseTime?: number;
  
  // Tech comparison
  currentTechnology: number; // K(currentTime)
  observedTechnology: number; // K(currentTime - tau)
  temporalMismatch: number; // currentTechnology - observedTechnology
  
  // Detection probabilities
  detectionProbabilityA: number; // Model A (No Light Delay)
  detectionProbability: number; // Model B (Real Light Delay)
  detectedA: boolean; // Detected in Model A
  detected: boolean; // Detected in Model B
  roundDetected?: number; // Search round in which it was detected
  
  // Wavefront / Signal travel
  signalStartArriveTime: number; // birthTime + tau
  signalEndArriveTime: number; // birthTime + signalLifetime + tau
  missReason: string; // Explanatory text
}

export interface SearchRound {
  roundNumber: number;
  startTime: number;
  searchRadius: number; // light years
  signalDistance: number; // distance traveled by signal
  starsScanned: number;
  civsScanned: number;
  detectedCount: number;
  notDetectedCount: number;
  collapsedCount: number;
  evolvedCount: number;
  stillExistingCount: number;
  unknownCount: number;
  avgTemporalMismatch: number;
  maxTemporalMismatch: number;
  detectionRate: number;
  cumulativeDetectionRate: number;
}

export interface SimulationParams {
  civCount: number; // Number of civilizations (e.g. 10,000 - 100,000)
  minDistance: number; // Min distance (ly)
  maxDistance: number; // Max distance (ly)
  minLifetime: number; // Min civilization lifetime (years)
  maxLifetime: number; // Max civilization lifetime (years)
  techGrowthRate: number; // Technology growth rate k (0.001 - 0.05)
  techModel: TechModelType; // Linear, Exponential, Logistic
  signalLifetime: number; // Technosignature duration (years)
  signalStrength: number; // Signal strength (0 to 1)
  directionality: number; // Directionality / Beaming factor (0 to 1)
  detectorSensitivity: number; // Earth detector sensitivity (0 to 1)
  simulationEpoch: number; // Current cosmic epoch in years (e.g. 10,000,000)
  seed: number; // Seed for deterministic PRNG
  distribution: DistributionType; // Spatial distribution
  
  // 3D Universe & Search parameters
  galaxyCount?: number; // Number of simulated galaxies (1 - 10)
  starsPerGalaxy?: number; // Number of sample stars (500 - 5000)
  searchRounds?: number; // Total search rounds (1 - 10)
  searchStrategy?: SearchStrategy;
  galaxyCoverage?: GalaxyCoverage;
  signalSpeedMultiplier?: number; // Visual animation speed
  civilizationEvolutionRate?: number; // Transition rate to higher tech
  civilizationCollapseProbability?: number; // Chance of premature collapse
}

export interface SimulationStats {
  totalCivilizations: number;
  detectedCount: number; // Model B
  detectionRate: number; // Model B %
  detectedCountA: number; // Model A
  detectionRateA: number; // Model A %
  detectionReduction: number; // (Rate A - Rate B) / Rate A * 100%
  detectionReductionAbs: number;
  avgDistance: number;
  avgTemporalMismatch: number;
  maxTemporalMismatch: number;
  avgObservedTech: number;
  avgCurrentTech: number;
  
  // Breakdown by state
  extinctCount: number;
  activeCount: number;
  notBornCount: number;
  developingCount: number;
  evolvedCount: number;
  undetectableCount: number;
  
  // Reasons for missing in Model B
  missNotReached: number;
  missPassed: number;
  missTooFaint: number;
  missLowTech: number;
  
  // Galaxies & Stars
  galaxies?: Galaxy[];
  stars?: Star[];
  
  // Multi-round search results
  searchRoundsHistory?: SearchRound[];
  currentRound?: number;
  starsScanned?: number;
  coveragePercent?: number;
  
  // Distribution bins for charts
  distanceBins: {
    distance: number;
    probB: number;
    probA: number;
    mismatch: number;
    count: number;
  }[];
  ageBins: { binLabel: string; count: number }[];
  techBins: { binLabel: string; countCurrent: number; countObserved: number }[];
  scatterSample: {
    distance: number;
    probB: number;
    probA?: number;
    mismatch: number;
    currentTech: number;
    observedTech: number;
  }[];
}

export interface ExperimentRecord {
  id: string;
  name: string;
  timestamp: string;
  presetName?: string;
  params: SimulationParams;
  stats: SimulationStats;
}

export interface PresetConfig {
  id: string;
  nameTh: string;
  nameEn: string;
  description: string;
  params: Partial<SimulationParams>;
}
