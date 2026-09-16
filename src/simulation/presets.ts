/**
 * Simulation Presets for SETI Temporal Mismatch Experiments
 */

import { PresetConfig, SimulationParams } from '../types/simulation';

export const DEFAULT_PARAMS: SimulationParams = {
  civCount: 10000,
  minDistance: 10,
  maxDistance: 100000,
  minLifetime: 1000,
  maxLifetime: 1000000,
  techGrowthRate: 0.02,
  techModel: 'logistic',
  signalLifetime: 10000,
  signalStrength: 0.75,
  directionality: 0.4,
  detectorSensitivity: 0.8,
  simulationEpoch: 5000000,
  seed: 4242,
  distribution: 'galactic_disk'
};

export const PRESETS: PresetConfig[] = [
  {
    id: 'short_lived',
    nameTh: '1. อารยธรรมอายุสั้น',
    nameEn: 'Short-lived Civilizations',
    description: 'อารยธรรมมีอายุเฉลี่ยสั้น (1,000 - 15,000 ปี) หน้าต่างส่งสัญญาณแคบ ส่งผลให้ Temporal Mismatch ทำให้โอกาสตรวจพบเกือบเป็นศูนย์',
    params: {
      civCount: 10000,
      minLifetime: 1000,
      maxLifetime: 15000,
      signalLifetime: 3000,
      techGrowthRate: 0.035,
      techModel: 'exponential',
      detectorSensitivity: 0.85
    }
  },
  {
    id: 'long_lived',
    nameTh: '2. อารยธรรมอายุยาว',
    nameEn: 'Long-lived Civilizations',
    description: 'อารยธรรมคงอยู่ยาวนานระดับ 500,000 ถึง 5,000,000 ปี สัญญาณมีโอกาสซ้อนทับกับช่วงเวลาที่โลกสังเกตได้สูงขึ้นมาก',
    params: {
      civCount: 10000,
      minLifetime: 200000,
      maxLifetime: 2000000,
      signalLifetime: 100000,
      techGrowthRate: 0.015,
      techModel: 'logistic',
      detectorSensitivity: 0.75
    }
  },
  {
    id: 'fast_tech',
    nameTh: '3. อารยธรรมพัฒนาเร็ว',
    nameEn: 'Rapid Tech Leap',
    description: 'อัตราการเติบโตทางเทคโนโลยีสูงมาก (k = 0.045) พัฒนาจนถึงขีดสุดในเวลาอันสั้น ทำให้เกิดความเหลื่อมล้ำทางเทคโนโลยี (Mismatch) มหาศาล',
    params: {
      civCount: 10000,
      techGrowthRate: 0.045,
      techModel: 'exponential',
      signalLifetime: 15000,
      signalStrength: 0.9,
      detectorSensitivity: 0.8
    }
  },
  {
    id: 'slow_tech',
    nameTh: '4. อารยธรรมพัฒนาช้า',
    nameEn: 'Slow Tech Evolution',
    description: 'อัตราการเติบโตต่ำ (k = 0.003) แบบเชิงเส้น กว่าจะถึงขั้นส่ง Technosignature ที่ชัดเจนต้องใช้เวลายาวนาน',
    params: {
      civCount: 10000,
      techGrowthRate: 0.003,
      techModel: 'linear',
      minLifetime: 50000,
      maxLifetime: 1000000,
      signalLifetime: 20000,
      detectorSensitivity: 0.7
    }
  },
  {
    id: 'deep_space',
    nameTh: '5. อารยธรรมระยะไกล',
    nameEn: 'Distant Deep Space',
    description: 'เน้นอารยธรรมในระดับกาแล็กซีระยะไกล (20,000 ถึง 100,000 ปีแสง) แสงต้องใช้เวลาเดินทางหลายหมื่นปี ภาพที่เห็นจึงเป็นอดีตอันไกลโพ้น',
    params: {
      civCount: 10000,
      minDistance: 20000,
      maxDistance: 100000,
      signalStrength: 0.95,
      detectorSensitivity: 0.9,
      techModel: 'logistic'
    }
  },
  {
    id: 'dense_population',
    nameTh: '6. อารยธรรมจำนวนมาก',
    nameEn: 'High Density (50k+)',
    description: 'จำลองประชากรอารยธรรมหนาแน่น 50,000 แห่ง ทั่วกาแล็กซี เพื่อทดสอบความคงทนของระบบและการกระจายตัวเชิงสถิติ',
    params: {
      civCount: 50000,
      minDistance: 10,
      maxDistance: 80000,
      techGrowthRate: 0.02,
      detectorSensitivity: 0.8
    }
  },
  {
    id: 'civilization_persistence',
    nameTh: '7. Civilization Persistence',
    nameEn: 'Civilization Persistence',
    description: 'สมมติฐานความยั่งยืน: อารยธรรมสร้างสิ่งก่อสร้างยักษ์ (Megastructures / Dyson Spheres) ที่ส่ง Technosignature ต่อเนื่องยาวนานเป็นแสนปี',
    params: {
      civCount: 10000,
      minLifetime: 500000,
      maxLifetime: 3000000,
      signalLifetime: 100000,
      signalStrength: 1.0,
      directionality: 0.2, // broad isotropic beacon
      detectorSensitivity: 0.85,
      techModel: 'logistic'
    }
  }
];
