/**
 * Detection Models for SETI: Model A (No Light Delay) vs Model B (Temporal Mismatch)
 */

import { PhysicsModel } from './physics';

export class DetectionModel {
  /**
   * Minimum technological threshold required to emit detectable technosignatures
   * (e.g., discovery of electromagnetic transmission or optical lasers)
   */
  public static readonly MIN_TECH_THRESHOLD = 0.05;

  /**
   * Reference detection threshold
   */
  public static readonly DETECTION_THRESHOLD = 0.35;

  /**
   * Model A: Theoretical Benchmark (No Temporal Mismatch)
   * Assumes instantaneous propagation - detector observes current technology and current state.
   */
  public static calculateProbabilityModelA(
    distanceLy: number,
    currentTech: number,
    signalStrength: number,
    directionality: number,
    detectorSensitivity: number,
    isCurrentlyActive: boolean
  ): number {
    if (!isCurrentlyActive || currentTech < this.MIN_TECH_THRESHOLD) {
      return 0.0;
    }

    // Flux factor based on geometric distance attenuation
    const fluxFactor = PhysicsModel.calculateFluxFactor(distanceLy, 250);

    // Tech factor (higher tech emits stronger, higher-order technosignatures)
    const techFactor = Math.pow(currentTech, 1.2);

    // Directionality and beam gain
    // High directionality increases signal strength at target, but has beam alignment factor
    const beamGain = 0.6 + 0.8 * directionality;

    // Combined SNR (Signal-to-Noise Ratio proxy)
    const snr = (0.35 * techFactor + 0.35 * fluxFactor + 0.15 * signalStrength) * beamGain;

    // Detector sensitivity scaling
    const rawProb = snr * Math.pow(detectorSensitivity, 0.75);

    return Math.max(0, Math.min(1.0, rawProb));
  }

  /**
   * Model B: Realistic Astrophysics (With Temporal Mismatch)
   * Incorporates Light Travel Time tau = distance / c, observed technology K(t_obs),
   * and signal wavefront co-temporality.
   */
  public static calculateProbabilityModelB(
    distanceLy: number,
    observedTech: number,
    signalStrength: number,
    directionality: number,
    detectorSensitivity: number,
    isSignalReachingEarth: boolean,
    temporalMismatch: number
  ): number {
    // If the signal wavefront has not arrived yet, or has already swept past Earth into the void:
    if (!isSignalReachingEarth) {
      return 0.0;
    }

    // If observed technology is below the detection threshold (i.e. at observation time, they were still pre-radio):
    if (observedTech < this.MIN_TECH_THRESHOLD) {
      return 0.0;
    }

    // Flux factor
    const fluxFactor = PhysicsModel.calculateFluxFactor(distanceLy, 250);

    // Observed tech factor (we see their PAST technology level, not current!)
    const techFactor = Math.pow(observedTech, 1.2);

    // Directionality factor
    const beamGain = 0.6 + 0.8 * directionality;

    // Combined detection probability
    let rawProb = (0.35 * techFactor + 0.35 * fluxFactor + 0.15 * signalStrength) * beamGain;

    // Detector sensitivity
    rawProb = rawProb * Math.pow(detectorSensitivity, 0.75);

    // High temporal mismatch often introduces spectral migration / obsolescence penalty
    if (temporalMismatch > 0.5) {
      // Signals may be archaic or pulse frequencies drifted
      const obsolescencePenalty = 1.0 - 0.15 * Math.min(1.0, temporalMismatch);
      rawProb *= obsolescencePenalty;
    }

    return Math.max(0, Math.min(1.0, rawProb));
  }

  /**
   * Determine whether a civilization is successfully detected
   * @param probability Calculated detection probability [0, 1]
   */
  public static isDetected(probability: number): boolean {
    return probability >= this.DETECTION_THRESHOLD;
  }
}
