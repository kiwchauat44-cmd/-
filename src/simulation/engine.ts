/**
 * Simulation Engine for SETI Temporal Mismatch Experiments & 3D Universe
 * High-performance procedural universe evaluation with multi-round search
 */

import {
  Civilization,
  Galaxy,
  Star,
  SearchRound,
  SimulationParams,
  SimulationStats,
  CivCurrentState,
  CivObservedState,
  TechnosignatureType
} from '../types/simulation';
import { DetectionModel } from './detection';
import { PhysicsModel } from './physics';
import { RandomGenerator } from './random';
import { TechnologyModel } from './technology';
import { UniverseGenerator } from './universe';

export type ProgressCallback = (completed: number, total: number, percentage: number) => void;

export class SimulationEngine {
  private isCancelled = false;

  public cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Validate simulation parameters
   */
  public static validateParams(params: SimulationParams): SimulationParams {
    const civCount = Math.max(10, Math.min(150000, Math.floor(params.civCount) || 10000));
    const minDistance = Math.max(1, Math.min(params.maxDistance - 1, params.minDistance || 10));
    const maxDistance = Math.max(minDistance + 1, Math.min(500000, params.maxDistance || 100000));
    const minLifetime = Math.max(100, Math.min(params.maxLifetime - 1, params.minLifetime || 1000));
    const maxLifetime = Math.max(minLifetime + 1, Math.min(10000000, params.maxLifetime || 1000000));
    const techGrowthRate = Math.max(0.0001, Math.min(0.2, params.techGrowthRate || 0.01));
    const signalLifetime = Math.max(10, Math.min(1000000, params.signalLifetime || 10000));
    const signalStrength = Math.max(0, Math.min(1.0, params.signalStrength ?? 0.8));
    const directionality = Math.max(0, Math.min(1.0, params.directionality ?? 0.3));
    const detectorSensitivity = Math.max(0.01, Math.min(1.0, params.detectorSensitivity ?? 0.5));
    const simulationEpoch = Math.max(100000, Math.min(50000000, params.simulationEpoch || 5000000));
    const seed = Math.floor(params.seed) || 42;
    const galaxyCount = Math.max(1, Math.min(10, params.galaxyCount || 5));
    const starsPerGalaxy = Math.max(200, Math.min(5000, params.starsPerGalaxy || 1200));
    const searchRounds = Math.max(1, Math.min(10, params.searchRounds || 4));
    const searchStrategy = params.searchStrategy || 'radial';
    const galaxyCoverage = params.galaxyCoverage || 'all_galaxies';

    return {
      ...params,
      civCount,
      minDistance,
      maxDistance,
      minLifetime,
      maxLifetime,
      techGrowthRate,
      signalLifetime,
      signalStrength,
      directionality,
      detectorSensitivity,
      simulationEpoch,
      seed,
      galaxyCount,
      starsPerGalaxy,
      searchRounds,
      searchStrategy,
      galaxyCoverage,
      civilizationEvolutionRate: params.civilizationEvolutionRate ?? 0.15,
      civilizationCollapseProbability: params.civilizationCollapseProbability ?? 0.3
    };
  }

  /**
   * Run simulation with chunking to keep UI responsive on mobile
   */
  public async runSimulation(
    rawParams: SimulationParams,
    onProgress?: ProgressCallback
  ): Promise<{
    civilizations: Civilization[];
    stats: SimulationStats;
    galaxies: Galaxy[];
    stars: Star[];
    searchRounds: SearchRound[];
  }> {
    this.isCancelled = false;
    const params = SimulationEngine.validateParams(rawParams);
    const rng = new RandomGenerator(params.seed);

    // 1. Procedural Universe & Star Generation
    const galaxies = UniverseGenerator.generateGalaxies(params.galaxyCount || 5, rng, params.maxDistance);
    const totalStars = Math.min(6000, (params.starsPerGalaxy || 1200) * galaxies.length);
    const stars = UniverseGenerator.generateStars(galaxies, totalStars, rng, params.maxDistance);

    const total = params.civCount;
    const civilizations: Civilization[] = new Array(total);

    const currentTime = params.simulationEpoch;
    const birthWindowStart = Math.max(0, currentTime - params.maxDistance * 1.5 - params.maxLifetime);
    const birthWindowSpan = Math.max(100000, (currentTime - birthWindowStart) * 1.2);

    let sumDistance = 0;
    let sumMismatch = 0;
    let maxMismatch = 0;
    let sumObsTech = 0;
    let sumCurTech = 0;

    let detectedBCount = 0;
    let detectedACount = 0;

    let extinctCount = 0;
    let activeCount = 0;
    let notBornCount = 0;
    let developingCount = 0;
    let evolvedCount = 0;
    let undetectableCount = 0;

    let missNotReached = 0;
    let missPassed = 0;
    let missTooFaint = 0;
    let missLowTech = 0;

    // Track civilization counts per galaxy
    const civCountPerGalaxy: Record<string, number> = {};
    galaxies.forEach((g) => (civCountPerGalaxy[g.id] = 0));

    // Chunk size for async calculation
    const chunkSize = 5000;
    let currentIndex = 0;

    while (currentIndex < total) {
      if (this.isCancelled) {
        throw new Error('Simulation cancelled by user');
      }

      const chunkEnd = Math.min(total, currentIndex + chunkSize);

      for (let i = currentIndex; i < chunkEnd; i++) {
        // Select host star / galaxy
        const star = stars[i % stars.length];
        const galaxy = galaxies.find((g) => g.id === star.galaxyId) || galaxies[0];
        civCountPerGalaxy[galaxy.id] = (civCountPerGalaxy[galaxy.id] || 0) + 1;

        // Spatial position based on star + local cluster jitter
        let px = star.position.x + rng.normal(0, 150);
        let py = star.position.y + rng.normal(0, 150);
        let pz = star.position.z + rng.normal(0, 80);

        let dist = Math.hypot(px, py, pz);
        if (dist < params.minDistance) {
          dist = params.minDistance + rng.range(0, 50);
        }
        if (dist > params.maxDistance) {
          const scale = (params.maxDistance / dist) * (0.8 + rng.range(0, 0.2));
          px *= scale;
          py *= scale;
          pz *= scale;
          dist = Math.hypot(px, py, pz);
        }

        const angle = Math.atan2(py, px);
        const zNorm = pz / (params.maxDistance * 0.1 || 1);

        // Temporal properties
        const birthTime = birthWindowStart + rng.range(0, birthWindowSpan);
        const lifetime = rng.range(params.minLifetime, params.maxLifetime);
        const civSignalLifetime = Math.min(
          lifetime,
          rng.range(params.signalLifetime * 0.5, params.signalLifetime * 1.5)
        );
        const growthRate = Math.max(0.0001, rng.normal(params.techGrowthRate, params.techGrowthRate * 0.2));
        const strength = Math.max(0, Math.min(1.0, rng.normal(params.signalStrength, 0.15)));
        const directionality = Math.max(0, Math.min(1.0, rng.normal(params.directionality, 0.15)));

        // Light travel time
        const lightTravelTime = PhysicsModel.calculateLightTravelTime(dist);
        const observationTime = PhysicsModel.calculateObservationTime(currentTime, lightTravelTime);

        // Technological development
        const currentAge = currentTime - birthTime;
        let currentTech = 0;
        let currentState: CivCurrentState = 'not_born';
        let evolutionStage = 'Pre-Industrial';
        let technosignature: TechnosignatureType = 'radio_signal';

        const collapseChance = params.civilizationCollapseProbability ?? 0.3;
        const evolutionChance = params.civilizationEvolutionRate ?? 0.15;
        const rollFate = rng.range(0, 1);

        if (currentTime < birthTime) {
          currentState = 'not_born';
          currentTech = 0;
          evolutionStage = 'ยังไม่ถือกำเนิด';
          notBornCount++;
        } else if (currentTime <= birthTime + lifetime) {
          currentTech = TechnologyModel.evaluateK(currentAge, growthRate, params.techModel, lifetime);

          if (currentTech < 0.25) {
            currentState = 'developing';
            evolutionStage = 'Emerging / Pre-Industrial';
            technosignature = 'low_detectability';
            developingCount++;
          } else if (currentTech >= 0.95 && rollFate < evolutionChance) {
            // Transcended to higher type (Type IV+ or post-biological)
            currentState = 'evolved';
            evolutionStage = 'Type IV+ (Transcended / Dyson Swarm)';
            technosignature = rng.range(0, 1) > 0.5 ? 'low_detectability' : 'no_detectable_signal';
            evolvedCount++;
          } else {
            currentState = 'active';
            if (currentTech < 0.5) {
              evolutionStage = 'Type I (Planetary)';
              technosignature = 'radio_signal';
            } else if (currentTech < 0.8) {
              evolutionStage = 'Type II (Stellar / Directed Beams)';
              technosignature = 'directed_beam';
            } else {
              evolutionStage = 'Type III (Galactic High-Energy)';
              technosignature = 'high_energy';
            }
            activeCount++;
          }
        } else {
          // Beyond lifetime: either collapsed or undetectable relic
          currentTech = TechnologyModel.evaluateK(currentAge, growthRate, params.techModel, lifetime);
          if (rollFate < collapseChance) {
            currentState = 'collapsed';
            evolutionStage = 'ล่มสลาย (Collapsed Remnant)';
            technosignature = 'no_detectable_signal';
            extinctCount++;
          } else {
            currentState = 'undetectable';
            evolutionStage = 'ปรับเปลี่ยนเทคโนโลยีจนตรวจไม่พบ';
            technosignature = 'low_detectability';
            undetectableCount++;
          }
        }

        // Observed State (Past image arriving at Earth)
        const observedAge = observationTime - birthTime;
        let observedState: CivObservedState = 'not_reached';
        let observedTech = 0;

        if (observationTime < birthTime) {
          observedState = 'not_reached';
          observedTech = 0;
        } else if (observationTime <= birthTime + lifetime) {
          observedState = 'active';
          observedTech = TechnologyModel.evaluateK(observedAge, growthRate, params.techModel, lifetime);
        } else {
          observedState = 'extinct_visible';
          observedTech = TechnologyModel.evaluateK(observedAge, growthRate, params.techModel, lifetime);
        }

        // Signal Reach Check
        const signalCheck = PhysicsModel.isSignalReachingEarth(
          currentTime,
          birthTime,
          civSignalLifetime,
          lightTravelTime
        );

        // Temporal Mismatch
        const temporalMismatch = Math.max(0, currentTech - observedTech);

        // Detection Model A (Instantaneous / Classical assumption)
        const probA = DetectionModel.calculateProbabilityModelA(
          dist,
          currentTech,
          strength,
          directionality,
          params.detectorSensitivity,
          currentState === 'active' || currentState === 'developing'
        );
        const isDetA = DetectionModel.isDetected(probA);
        if (isDetA) detectedACount++;

        // Technosignature detectability modifier
        let sigFactor = 1.0;
        if (technosignature === 'low_detectability') sigFactor = 0.25;
        if (technosignature === 'no_detectable_signal') sigFactor = 0.0;
        if (technosignature === 'directed_beam') sigFactor = 1.4 * directionality;

        // Detection Model B (Realistic Light Delay & Temporal Mismatch)
        const effectiveStrength = strength * sigFactor;
        const probB = DetectionModel.calculateProbabilityModelB(
          dist,
          observedTech,
          effectiveStrength,
          directionality,
          params.detectorSensitivity,
          signalCheck.isReaching && technosignature !== 'no_detectable_signal',
          temporalMismatch
        );
        const isDetB = DetectionModel.isDetected(probB);
        if (isDetB) detectedBCount++;

        // Miss explanation
        let missReason = signalCheck.reason;
        if (!isDetB) {
          if (!signalCheck.isReaching) {
            if (currentTime < birthTime + lightTravelTime) {
              missNotReached++;
            } else {
              missPassed++;
            }
          } else if (observedTech < DetectionModel.MIN_TECH_THRESHOLD) {
            missLowTech++;
            missReason = 'คลื่นแสงเดินทางถึงโลกแล้ว แต่อดีตในยุคนั้นเทคโนโลยียังไม่ส่งสัญญาณ (Low Tech)';
          } else if (technosignature === 'no_detectable_signal' || technosignature === 'low_detectability') {
            missReason = 'อารยธรรมเปลี่ยนรูปแบบการสื่อสารเป็นความถี่สูง/ควอนตัม ทำให้ตรวจไม่พบสัญญาณแบบดั้งเดิม';
          } else {
            missTooFaint++;
            missReason = 'สัญญาณจางเกินไปเมื่อเดินทางข้ามอวกาศไกล (Inverse-Square attenuation / Low SNR)';
          }
        } else {
          missReason = 'ตรวจพบสำเร็จ! สัญญาณ Technosignature เดินทางมาตัดผ่านโลกและมีความเข้มข้นเพียงพอ';
        }

        sumDistance += dist;
        sumMismatch += temporalMismatch;
        if (temporalMismatch > maxMismatch) maxMismatch = temporalMismatch;
        sumObsTech += observedTech;
        sumCurTech += currentTech;

        // Assign to star
        star.hasCivilization = true;
        star.civId = i + 1;

        civilizations[i] = {
          id: i + 1,
          name: `${galaxy.name.split(' ')[0]}-Civ-${i + 1}`,
          galaxyId: galaxy.id,
          galaxyName: galaxy.name,
          starId: star.id,
          starName: star.name,
          position: { x: Math.round(px), y: Math.round(py), z: Math.round(pz) },
          distance: Math.round(dist * 10) / 10,
          angle,
          z: zNorm,
          birthTime,
          civilizationAge: Math.max(0, Math.round(currentAge)),
          civilizationLifetime: Math.round(lifetime),
          technologyLevel: Math.round(currentTech * 1000) / 1000,
          technologyGrowthRate: growthRate,
          signalStrength: Math.round(strength * 100) / 100,
          signalLifetime: Math.round(civSignalLifetime),
          communicationRange: Math.round(Math.min(dist * 1.5, civSignalLifetime)),
          directionality: Math.round(directionality * 100) / 100,
          lightTravelTime: Math.round(lightTravelTime),
          currentState,
          observedState,
          evolutionStage,
          technosignatureType: technosignature,
          collapseTime: currentState === 'collapsed' ? birthTime + lifetime : undefined,
          currentTechnology: Math.round(currentTech * 1000) / 1000,
          observedTechnology: Math.round(observedTech * 1000) / 1000,
          temporalMismatch: Math.round(temporalMismatch * 1000) / 1000,
          detectionProbabilityA: Math.round(probA * 1000) / 1000,
          detectionProbability: Math.round(probB * 1000) / 1000,
          detectedA: isDetA,
          detected: isDetB,
          signalStartArriveTime: birthTime + lightTravelTime,
          signalEndArriveTime: birthTime + civSignalLifetime + lightTravelTime,
          missReason
        };
      }

      currentIndex = chunkEnd;
      if (onProgress) {
        onProgress(currentIndex, total, Math.round((currentIndex / total) * 100));
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Update galaxy civ counts
    galaxies.forEach((g) => {
      g.civCount = civCountPerGalaxy[g.id] || 0;
    });

    // 2. Multi-round Search Engine evaluation
    const totalRounds = params.searchRounds || 4;
    const searchRoundsHistory: SearchRound[] = [];
    let cumulativeDetected = 0;
    const detectedSet = new Set<number>();

    for (let r = 1; r <= totalRounds; r++) {
      // Radius expands per round (e.g. 25%, 50%, 75%, 100% of maxDistance or strategy-based)
      const fraction = r / totalRounds;
      const roundRadius = Math.round(params.minDistance + (params.maxDistance - params.minDistance) * fraction);
      const signalTravelDist = roundRadius;

      let roundStarsScanned = 0;
      let roundCivsScanned = 0;
      let roundDetected = 0;
      let roundNotDetected = 0;
      let roundCollapsed = 0;
      let roundEvolved = 0;
      let roundStillExisting = 0;
      let roundUnknown = 0;
      let roundSumMismatch = 0;
      let roundMaxMismatch = 0;

      for (let i = 0; i < total; i++) {
        const civ = civilizations[i];

        // Coverage filtering
        if (params.galaxyCoverage === 'milky_way' && civ.galaxyId !== 'gal-milky-way') {
          continue;
        }

        // Distance / Search area check
        if (civ.distance <= roundRadius) {
          roundCivsScanned++;
          roundSumMismatch += civ.temporalMismatch;
          if (civ.temporalMismatch > roundMaxMismatch) {
            roundMaxMismatch = civ.temporalMismatch;
          }

          if (civ.currentState === 'collapsed') roundCollapsed++;
          else if (civ.currentState === 'evolved') roundEvolved++;
          else if (civ.currentState === 'active' || civ.currentState === 'developing') roundStillExisting++;
          else roundUnknown++;

          if (civ.detected) {
            roundDetected++;
            if (!detectedSet.has(civ.id)) {
              detectedSet.add(civ.id);
              civ.roundDetected = r;
            }
          } else {
            roundNotDetected++;
          }
        }
      }

      roundStarsScanned = Math.round(stars.length * fraction);
      cumulativeDetected = detectedSet.size;

      const detectionRate = roundCivsScanned > 0 ? (roundDetected / roundCivsScanned) * 100 : 0;
      const cumulativeDetectionRate = total > 0 ? (cumulativeDetected / total) * 100 : 0;
      const avgTemporalMismatch = roundCivsScanned > 0 ? roundSumMismatch / roundCivsScanned : 0;

      searchRoundsHistory.push({
        roundNumber: r,
        startTime: currentTime,
        searchRadius: roundRadius,
        signalDistance: signalTravelDist,
        starsScanned: roundStarsScanned,
        civsScanned: roundCivsScanned,
        detectedCount: roundDetected,
        notDetectedCount: roundNotDetected,
        collapsedCount: roundCollapsed,
        evolvedCount: roundEvolved,
        stillExistingCount: roundStillExisting,
        unknownCount: roundUnknown,
        avgTemporalMismatch: Math.round(avgTemporalMismatch * 1000) / 1000,
        maxTemporalMismatch: Math.round(roundMaxMismatch * 1000) / 1000,
        detectionRate: Math.round(detectionRate * 100) / 100,
        cumulativeDetectionRate: Math.round(cumulativeDetectionRate * 100) / 100
      });
    }

    // 3. Distance Bins for Charts (including Recharts)
    const binCount = 20;
    const binWidth = (params.maxDistance - params.minDistance) / binCount;
    const distanceBins: SimulationStats['distanceBins'] = [];

    for (let b = 0; b < binCount; b++) {
      const bMin = params.minDistance + b * binWidth;
      const bMax = bMin + binWidth;
      const bMid = Math.round(bMin + binWidth / 2);

      let bCount = 0;
      let bSumProbB = 0;
      let bSumProbA = 0;
      let bSumMismatch = 0;

      for (let i = 0; i < total; i++) {
        const civ = civilizations[i];
        if (civ.distance >= bMin && civ.distance < bMax) {
          bCount++;
          bSumProbB += civ.detectionProbability;
          bSumProbA += civ.detectionProbabilityA;
          bSumMismatch += civ.temporalMismatch;
        }
      }

      distanceBins.push({
        distance: bMid,
        probB: bCount > 0 ? Math.round((bSumProbB / bCount) * 1000) / 1000 : 0,
        probA: bCount > 0 ? Math.round((bSumProbA / bCount) * 1000) / 1000 : 0,
        mismatch: bCount > 0 ? Math.round((bSumMismatch / bCount) * 1000) / 1000 : 0,
        count: bCount
      });
    }

    // 4. Age & Tech Bins
    const ageBins = [
      { binLabel: '< 10k yr', count: 0 },
      { binLabel: '10k-50k yr', count: 0 },
      { binLabel: '50k-200k yr', count: 0 },
      { binLabel: '200k-1M yr', count: 0 },
      { binLabel: '> 1M yr', count: 0 }
    ];

    for (let i = 0; i < total; i++) {
      const age = civilizations[i].civilizationAge;
      if (age < 10000) ageBins[0].count++;
      else if (age < 50000) ageBins[1].count++;
      else if (age < 200000) ageBins[2].count++;
      else if (age < 1000000) ageBins[3].count++;
      else ageBins[4].count++;
    }

    const techBins = [
      { binLabel: '0.0 - 0.2', countCurrent: 0, countObserved: 0 },
      { binLabel: '0.2 - 0.4', countCurrent: 0, countObserved: 0 },
      { binLabel: '0.4 - 0.6', countCurrent: 0, countObserved: 0 },
      { binLabel: '0.6 - 0.8', countCurrent: 0, countObserved: 0 },
      { binLabel: '0.8 - 1.0', countCurrent: 0, countObserved: 0 }
    ];

    for (let i = 0; i < total; i++) {
      const cIdx = Math.min(4, Math.floor(civilizations[i].currentTechnology * 5));
      const oIdx = Math.min(4, Math.floor(civilizations[i].observedTechnology * 5));
      techBins[cIdx].countCurrent++;
      techBins[oIdx].countObserved++;
    }

    // 5. Scatter sample for fast chart rendering
    const sampleSize = Math.min(400, total);
    const scatterSample = [];
    const step = Math.max(1, Math.floor(total / sampleSize));
    for (let i = 0; i < total && scatterSample.length < sampleSize; i += step) {
      scatterSample.push({
        distance: civilizations[i].distance,
        probB: civilizations[i].detectionProbability,
        probA: civilizations[i].detectionProbabilityA,
        mismatch: civilizations[i].temporalMismatch,
        currentTech: civilizations[i].currentTechnology,
        observedTech: civilizations[i].observedTechnology
      });
    }

    // Overall Rates
    const detectionRateB = total > 0 ? (detectedBCount / total) * 100 : 0;
    const detectionRateA = total > 0 ? (detectedACount / total) * 100 : 0;
    const detectionReductionAbs = detectionRateA - detectionRateB;
    const detectionReduction = detectionRateA > 0 ? ((detectionRateA - detectionRateB) / detectionRateA) * 100 : 0;

    const stats: SimulationStats = {
      totalCivilizations: total,
      detectedCount: detectedBCount,
      detectionRate: Math.round(detectionRateB * 100) / 100,
      detectedCountA: detectedACount,
      detectionRateA: Math.round(detectionRateA * 100) / 100,
      detectionReduction: Math.round(detectionReduction * 100) / 100,
      detectionReductionAbs: Math.round(detectionReductionAbs * 100) / 100,
      avgDistance: Math.round(sumDistance / total),
      avgTemporalMismatch: Math.round((sumMismatch / total) * 1000) / 1000,
      maxTemporalMismatch: Math.round(maxMismatch * 1000) / 1000,
      avgObservedTech: Math.round((sumObsTech / total) * 1000) / 1000,
      avgCurrentTech: Math.round((sumCurTech / total) * 1000) / 1000,
      extinctCount,
      activeCount,
      notBornCount,
      developingCount,
      evolvedCount,
      undetectableCount,
      missNotReached,
      missPassed,
      missTooFaint,
      missLowTech,
      galaxies,
      stars,
      searchRoundsHistory,
      currentRound: totalRounds,
      starsScanned: totalStars,
      coveragePercent: 100,
      distanceBins,
      ageBins,
      techBins,
      scatterSample
    };

    return { civilizations, stats, galaxies, stars, searchRounds: searchRoundsHistory };
  }
}
