/**
 * Physics Model for SETI Light Travel Time & Wavefronts
 */

export class PhysicsModel {
  /**
   * Speed of light constant in light-years per year
   * In units of (ly / year), c = 1.0
   */
  public static readonly C_LIGHT_YEARS_PER_YEAR = 1.0;

  /**
   * Calculate Light Travel Time (tau) in years
   * tau = distance / c
   * Since distance is in light-years and c = 1 ly/yr, tau = distance
   */
  public static calculateLightTravelTime(distanceLightYears: number): number {
    return Math.max(0, distanceLightYears / this.C_LIGHT_YEARS_PER_YEAR);
  }

  /**
   * Calculate observation time at Earth
   * observationTime = currentTime - tau
   */
  public static calculateObservationTime(currentTime: number, lightTravelTime: number): number {
    return currentTime - lightTravelTime;
  }

  /**
   * Check if an active signal wavefront intersects Earth at currentTime
   * Signal is emitted from t_start to t_end = t_start + signalLifetime
   * Arrives at Earth from (t_start + tau) to (t_end + tau)
   */
  public static isSignalReachingEarth(
    currentTime: number,
    birthTime: number,
    signalLifetime: number,
    lightTravelTime: number
  ): {
    isReaching: boolean;
    reason: string;
    progressToEarth: number; // 0 (at origin) to 1 (at or beyond Earth)
    timeDiff: number; // positive = future arrival, negative = passed in past
  } {
    const signalArrivalStart = birthTime + lightTravelTime;
    const signalArrivalEnd = birthTime + signalLifetime + lightTravelTime;

    // Progress of leading edge toward Earth
    // Time since emission = currentTime - birthTime
    // Light has traveled (currentTime - birthTime) light years.
    // Progress fraction = (currentTime - birthTime) / lightTravelTime
    const timeSinceBirth = currentTime - birthTime;
    let progress = 0;
    if (lightTravelTime > 0) {
      progress = Math.max(0, Math.min(1.5, timeSinceBirth / lightTravelTime));
    }

    if (currentTime < birthTime) {
      return {
        isReaching: false,
        reason: 'อารยธรรมยังไม่ถือกำเนิดในกาลเวลาปัจจุบัน',
        progressToEarth: 0,
        timeDiff: birthTime - currentTime
      };
    }

    if (currentTime < signalArrivalStart) {
      const waitYears = Math.round(signalArrivalStart - currentTime);
      return {
        isReaching: false,
        reason: `สัญญาณแสงยังเดินทางมาไม่ถึงโลก (ต้องรออีก ~${waitYears.toLocaleString()} ปี)`,
        progressToEarth: progress,
        timeDiff: signalArrivalStart - currentTime
      };
    }

    if (currentTime > signalArrivalEnd) {
      const pastYears = Math.round(currentTime - signalArrivalEnd);
      return {
        isReaching: false,
        reason: `สัญญาณแสงได้เคลื่อนที่ผ่านโลกไปแล้วในอดีต (ผ่านไปเมื่อ ~${pastYears.toLocaleString()} ปีที่แล้ว)`,
        progressToEarth: 1.0,
        timeDiff: signalArrivalEnd - currentTime
      };
    }

    // Inside arrival window!
    return {
      isReaching: true,
      reason: 'สัญญาณแสงกำลังเดินทางมาถึงและตัดผ่านโลกในปัจจุบันพอดี',
      progressToEarth: 1.0,
      timeDiff: 0
    };
  }

  /**
   * Geometric attenuation (Inverse-Square Law with baseline normalization)
   * Flux density at distance d: F = P / (4 * pi * d^2)
   */
  public static calculateFluxFactor(distanceLy: number, refDistance = 100): number {
    // Normalization factor so close civs have fluxFactor ~ 1.0, distant civs decay gracefully
    // Using smooth log-scale or soft inverse square to preserve dynamic range across 100,000 ly
    const dRatio = distanceLy / refDistance;
    return Math.max(0.0001, Math.min(1.0, 1.0 / (1.0 + Math.log10(1 + dRatio * dRatio))));
  }
}
