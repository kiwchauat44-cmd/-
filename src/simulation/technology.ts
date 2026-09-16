/**
 * Technology Evolution Models for SETI Civilizations
 * K(t) simulates technological level as a function of civilization age t
 */

import { TechModelType } from '../types/simulation';

export class TechnologyModel {
  /**
   * Calculate technology level K(t) in [0, 1]
   * @param age Age of civilization in years (since birth)
   * @param growthRate Growth parameter k (e.g. 0.001 - 0.05)
   * @param model 'linear' | 'exponential' | 'logistic'
   * @param lifetime Total civilization lifetime before extinction/collapse
   */
  public static evaluateK(
    age: number,
    growthRate: number,
    model: TechModelType,
    lifetime: number
  ): number {
    if (age <= 0) return 0;

    // After lifetime, does tech stay at peak relic or decay?
    // In standard SETI, if civilization went extinct at `lifetime`, its active technology ceases or remains relic
    const activeAge = Math.min(age, lifetime);

    let kVal = 0;
    switch (model) {
      case 'linear': {
        // Linear: K(t) = k * t
        // Normalized with reference age 50,000 * growthRate
        kVal = activeAge * growthRate * 0.05;
        break;
      }
      case 'exponential': {
        // Exponential approach to asymptote: K(t) = 1 - exp(-k * t)
        // High growth rate reaches 1.0 very rapidly
        const scaledK = growthRate * 0.08;
        kVal = 1 - Math.exp(-scaledK * (activeAge / 100));
        break;
      }
      case 'logistic': {
        // S-curve Logistic: K(t) = 1 / (1 + exp(-k * (t - t_mid)))
        // t_mid is midpoint of emergence (e.g. 25% of expected lifetime or fixed milestone)
        const tMid = Math.max(500, lifetime * 0.25);
        const scaledK = growthRate * 0.005;
        const z = -scaledK * (activeAge - tMid);
        // Safe sigmoid to avoid numerical overflow
        if (z > 40) kVal = 0;
        else if (z < -40) kVal = 1;
        else kVal = 1 / (1 + Math.exp(z));
        break;
      }
    }

    // If civilization is past its lifetime, active tech is obsolete or collapsed (relic remains at reduced signature)
    if (age > lifetime) {
      // Tech drops or becomes dormant archaeological relics
      const decayTime = age - lifetime;
      const decayFactor = Math.exp(-decayTime / Math.max(1000, lifetime * 0.2));
      kVal = kVal * decayFactor;
    }

    return Math.max(0, Math.min(1.0, kVal));
  }

  /**
   * Get analytical formula text for display
   */
  public static getFormula(model: TechModelType): { title: string; latex: string; desc: string } {
    switch (model) {
      case 'linear':
        return {
          title: 'แบบเชิงเส้น (Linear)',
          latex: 'K(t) = \\min(1.0, \\, k \\cdot t)',
          desc: 'เทคโนโลยีเติบโตในอัตราคงที่ตามกาลเวลา เหมาะสำหรับอารยธรรมที่ก้าวหน้าทีละขั้นอย่างสม่ำเสมอ'
        };
      case 'exponential':
        return {
          title: 'แบบเอกซ์โพเนนเชียล (Exponential)',
          latex: 'K(t) = 1 - e^{-k \\cdot t}',
          desc: 'เทคโนโลยีก้าวกระโดดอย่างรวดเร็วในระยะเริ่มต้น แล้วค่อยๆ ชะลอตัวเข้าสู่ขีดจำกัดทางฟิสิกส์'
        };
      case 'logistic':
        return {
          title: 'แบบลอจิสติก (Logistic S-Curve)',
          latex: 'K(t) = \\frac{1}{1 + e^{-k(t - t_0)}}',
          desc: 'รูปแบบ S-Curve ที่สมจริง: ช้าในช่วงตั้งไข่ ก้าวกระโดดในช่วงปฏิวัติอุตสาหกรรม และอิ่มตัวเมื่อถึงขีดสุด'
        };
    }
  }
}
