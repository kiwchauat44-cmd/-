/**
 * Procedural Universe, Galaxy & Star Generator for 3D SETI Simulation
 */

import { Galaxy, Star, SpectralClass, GalaxyType } from '../types/simulation';
import { RandomGenerator } from './random';

export class UniverseGenerator {
  /**
   * Procedurally generate a set of galaxies in the observable simulation volume
   */
  public static generateGalaxies(count: number, rng: RandomGenerator, maxDistLy: number): Galaxy[] {
    const galaxies: Galaxy[] = [];

    // 1. Always generate the Milky Way (centered at (0,0,0) relative to local group or local coordinate system)
    galaxies.push({
      id: 'gal-milky-way',
      name: 'Milky Way (ทางช้างเผือก)',
      type: 'spiral',
      position: { x: 0, y: 0, z: 0 },
      distanceFromEarth: 0,
      size: 100000,
      starCount: 250000000000,
      age: 13.6,
      civCount: 0,
      isMilkyWay: true
    });

    // Preset list of prominent neighboring galaxies
    const neighborPresets: { name: string; type: GalaxyType; distRatio: number; angle: number; z: number; size: number }[] = [
      { name: 'Andromeda (M31)', type: 'spiral', distRatio: 0.65, angle: 0.4, z: 0.25, size: 150000 },
      { name: 'Triangulum (M33)', type: 'spiral', distRatio: 0.75, angle: 1.2, z: -0.2, size: 60000 },
      { name: 'Large Magellanic Cloud (LMC)', type: 'irregular', distRatio: 0.25, angle: 2.8, z: -0.35, size: 14000 },
      { name: 'Small Magellanic Cloud (SMC)', type: 'irregular', distRatio: 0.3, angle: 3.1, z: -0.4, size: 7000 },
      { name: 'Sagittarius Dwarf', type: 'elliptical', distRatio: 0.15, angle: 4.2, z: -0.15, size: 10000 },
      { name: 'Centaurus A Satellite', type: 'elliptical', distRatio: 0.85, angle: 5.1, z: 0.3, size: 45000 },
      { name: 'Sculptor Dwarf', type: 'elliptical', distRatio: 0.35, angle: 1.8, z: -0.5, size: 8000 },
      { name: 'Fornax Dwarf', type: 'elliptical', distRatio: 0.5, angle: 4.8, z: -0.4, size: 12000 }
    ];

    const targetCount = Math.max(1, Math.min(10, count));
    for (let i = 1; i < targetCount; i++) {
      const preset = neighborPresets[(i - 1) % neighborPresets.length];
      const dist = maxDistLy * (preset.distRatio * (0.8 + rng.range(0, 0.4)));
      const angle = preset.angle + rng.range(-0.2, 0.2);
      const zOffset = preset.z * dist;

      galaxies.push({
        id: `gal-${i}`,
        name: preset.name,
        type: preset.type,
        position: {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          z: zOffset
        },
        distanceFromEarth: Math.round(dist),
        size: preset.size,
        starCount: Math.round(rng.range(5e9, 1e12)),
        age: Math.round(rng.range(8, 13.8) * 10) / 10,
        civCount: 0,
        isMilkyWay: false
      });
    }

    return galaxies;
  }

  /**
   * Procedurally generate stars sample for the 3D visualization and simulation
   */
  public static generateStars(
    galaxies: Galaxy[],
    totalStarCount: number,
    rng: RandomGenerator,
    maxDistLy: number
  ): Star[] {
    const stars: Star[] = [];
    const spectralWeights: { type: SpectralClass; weight: number; massMin: number; massMax: number }[] = [
      { type: 'O', weight: 0.0001, massMin: 16, massMax: 50 },
      { type: 'B', weight: 0.001, massMin: 2.1, massMax: 16 },
      { type: 'A', weight: 0.01, massMin: 1.4, massMax: 2.1 },
      { type: 'F', weight: 0.03, massMin: 1.04, massMax: 1.4 },
      { type: 'G', weight: 0.08, massMin: 0.8, massMax: 1.04 }, // Solar type
      { type: 'K', weight: 0.15, massMin: 0.45, massMax: 0.8 },
      { type: 'M', weight: 0.7289, massMin: 0.08, massMax: 0.45 } // Red dwarf
    ];

    const pickSpectralType = (): { type: SpectralClass; mass: number } => {
      const r = rng.range(0, 1);
      let cumulative = 0;
      for (const sw of spectralWeights) {
        cumulative += sw.weight;
        if (r <= cumulative) {
          return {
            type: sw.type,
            mass: rng.range(sw.massMin, sw.massMax)
          };
        }
      }
      return { type: 'G', mass: 1.0 };
    };

    // Distribute stars across galaxies, with Milky Way getting ~60% of sample
    for (let i = 0; i < totalStarCount; i++) {
      let targetGalaxy = galaxies[0];
      if (galaxies.length > 1 && rng.range(0, 1) > 0.6) {
        targetGalaxy = galaxies[Math.floor(rng.range(1, galaxies.length))];
      }

      let px = 0;
      let py = 0;
      let pz = 0;

      if (targetGalaxy.isMilkyWay) {
        // Spiral galaxy distribution (Logarithmic spiral arms + Core bulge)
        const inCore = rng.range(0, 1) < 0.25;
        if (inCore) {
          // Bulge
          const r = rng.range(0, targetGalaxy.size * 0.15);
          const th = rng.range(0, Math.PI * 2);
          px = r * Math.cos(th);
          py = r * Math.sin(th);
          pz = rng.normal(0, targetGalaxy.size * 0.04);
        } else {
          // 4 Spiral Arms
          const armIndex = Math.floor(rng.range(0, 4));
          const armAngleOffset = (armIndex * Math.PI) / 2;
          const t = rng.range(0.1, 1.0);
          const r = t * (targetGalaxy.size * 0.48);
          const spiralAngle = armAngleOffset + 2.5 * Math.log(t * 10 + 1) + rng.normal(0, 0.25);
          px = r * Math.cos(spiralAngle);
          py = r * Math.sin(spiralAngle);
          pz = rng.normal(0, targetGalaxy.size * 0.02);
        }
      } else {
        // Satellite or distant galaxy
        const gr = rng.range(0, targetGalaxy.size * 0.4);
        const th = rng.range(0, Math.PI * 2);
        px = targetGalaxy.position.x + gr * Math.cos(th);
        py = targetGalaxy.position.y + gr * Math.sin(th);
        pz = targetGalaxy.position.z + rng.normal(0, targetGalaxy.size * 0.15);
      }

      // Distance from Earth (assumed at (8000, 0, 0) relative to Milky Way core, or origin)
      const dist = Math.hypot(px, py, pz);
      const spec = pickSpectralType();

      // Planets count & habitability
      let planets = 0;
      let habitableProb = 0;
      if (spec.type === 'G' || spec.type === 'K') {
        planets = Math.floor(rng.range(3, 11));
        habitableProb = rng.range(0.15, 0.45);
      } else if (spec.type === 'M') {
        planets = Math.floor(rng.range(1, 8));
        habitableProb = rng.range(0.05, 0.2);
      } else if (spec.type === 'F') {
        planets = Math.floor(rng.range(2, 9));
        habitableProb = rng.range(0.05, 0.25);
      } else {
        planets = Math.floor(rng.range(0, 4));
        habitableProb = 0.01;
      }

      const civProb = habitableProb * (spec.type === 'G' || spec.type === 'K' ? 0.08 : 0.02);

      stars.push({
        id: `star-${i + 1}`,
        galaxyId: targetGalaxy.id,
        name: `${targetGalaxy.isMilkyWay ? 'MW' : targetGalaxy.id.toUpperCase()}-${spec.type}${i + 1000}`,
        position: { x: Math.round(px), y: Math.round(py), z: Math.round(pz) },
        distanceFromEarth: Math.round(dist),
        mass: Math.round(spec.mass * 100) / 100,
        age: Math.round(rng.range(500, 10000)),
        spectralClass: spec.type,
        planetsCount: planets,
        habitableProbability: Math.round(habitableProb * 1000) / 1000,
        civProbability: Math.round(civProb * 10000) / 10000,
        hasCivilization: false
      });
    }

    return stars;
  }
}
