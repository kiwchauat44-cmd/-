/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 * Provides deterministic simulation repeatability and astrophysical distributions
 */

export class RandomGenerator {
  private s: number;

  constructor(seed: number) {
    this.s = Math.floor(seed) || 1337;
  }

  /**
   * Reset seed state
   */
  public reseed(seed: number): void {
    this.s = Math.floor(seed) || 1337;
  }

  /**
   * Generate next float in [0, 1)
   */
  public next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Float in [min, max)
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Integer in [min, max]
   */
  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Standard Gaussian (Box-Muller transform)
   */
  public normal(mean = 0, stdDev = 1): number {
    let u1 = this.next();
    let u2 = this.next();
    while (u1 <= 1e-7) u1 = this.next(); // avoid log(0)
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Exponential distribution with rate lambda
   */
  public exponential(lambda: number): number {
    let u = this.next();
    while (u <= 1e-7) u = this.next();
    return -Math.log(1.0 - u) / lambda;
  }

  /**
   * Power-law distribution between min and max with exponent alpha
   */
  public powerLaw(min: number, max: number, alpha: number): number {
    const u = this.next();
    if (alpha === -1) {
      return min * Math.pow(max / min, u);
    }
    const exp = alpha + 1;
    return Math.pow((Math.pow(max, exp) - Math.pow(min, exp)) * u + Math.pow(min, exp), 1 / exp);
  }

  /**
   * Galactic disk radial distribution
   * In a 2D galactic disk with scale length R_d, density is sigma(r) ~ exp(-r / R_d).
   * Volume element is 2*pi*r*dr.
   */
  public galacticDistance(minD: number, maxD: number): number {
    // Mixture of realistic disk area density (r * dr) and bounded range
    // Using inverse transform sampling for area density r*dr gives r = sqrt(min^2 + u*(max^2 - min^2))
    const u = this.next();
    const rArea = Math.sqrt(minD * minD + u * (maxD * maxD - minD * minD));
    return Math.min(maxD, Math.max(minD, rArea));
  }
}
