import React, { useState } from 'react';
import { Play, RotateCcw, Dices, Layers, Sparkles, Check, ChevronDown, Info } from 'lucide-react';
import { PRESETS } from '../simulation/presets';
import { TechnologyModel } from '../simulation/technology';
import { SimulationParams, TechModelType } from '../types/simulation';

interface SettingsTabProps {
  params: SimulationParams;
  onUpdateParams: (newParams: SimulationParams) => void;
  onStartSimulation: () => void;
  onResetDefaults: () => void;
  onRandomizeSeed: () => void;
  isRunning: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  params,
  onUpdateParams,
  onStartSimulation,
  onResetDefaults,
  onRandomizeSeed,
  isRunning
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setActivePreset(null);
    onUpdateParams({
      ...params,
      [key]: value
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      onUpdateParams({
        ...params,
        ...preset.params
      });
    }
  };

  const currentFormula = TechnologyModel.getFormula(params.techModel);

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
      {/* Quick Presets Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 font-tech">
              พรีเซ็ตการทดลองด่วน (Presets)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">เลือกสถานการณ์ที่ต้องการทดสอบ</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => applyPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all min-h-[58px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-sm shadow-cyan-500/20 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs leading-tight flex items-center justify-between w-full">
                  <span>{preset.nameTh}</span>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-400 leading-snug line-clamp-1 mt-1">
                  {preset.nameEn}
                </div>
              </button>
            );
          })}
        </div>

        {activePreset && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
            <span className="font-bold">คำอธิบายพรีเซ็ต: </span>
            {PRESETS.find((p) => p.id === activePreset)?.description}
          </div>
        )}
      </div>

      {/* Main Parameters Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 font-tech">
              กำหนดพารามิเตอร์การจำลอง
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Slider & ช่องกรอกตัวเลขแบบ Real-time</span>
        </div>

        {/* Param 1: Civ Count */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="param-civ-count" className="font-medium text-slate-200">
              จำนวนอารยธรรม (N)
            </label>
            <span className="text-cyan-400 font-bold font-tech text-xs">
              {params.civCount.toLocaleString()} แห่ง
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 items-center">
            <input
              type="range"
              id="slider-civ-count"
              min="100"
              max="100000"
              step="500"
              value={params.civCount}
              onChange={(e) => updateParam('civCount', Number(e.target.value))}
              className="col-span-3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <input
              type="number"
              id="param-civ-count"
              min="100"
              max="150000"
              value={params.civCount}
              onChange={(e) => updateParam('civCount', Math.max(10, Math.min(150000, Number(e.target.value) || 100)))}
              className="col-span-1 min-h-[38px] px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-center text-slate-100 focus:border-cyan-400 outline-none"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            *รองรับการประมวลผลสูงสุด 100,000 อารยธรรมได้อย่างราบรื่น
          </p>
        </div>

        {/* Param 2: Distance Range */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="param-max-distance" className="font-medium text-slate-200">
              ช่วงระยะทางสูงสุด (Max Distance)
            </label>
            <span className="text-cyan-400 font-bold font-tech text-xs">
              {params.minDistance.toLocaleString()} ถึง {params.maxDistance.toLocaleString()} ปีแสง
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 items-center">
            <input
              type="range"
              id="slider-max-distance"
              min="1000"
              max="150000"
              step="1000"
              value={params.maxDistance}
              onChange={(e) => updateParam('maxDistance', Number(e.target.value))}
              className="col-span-3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <input
              type="number"
              id="param-max-distance"
              min="500"
              max="250000"
              value={params.maxDistance}
              onChange={(e) => updateParam('maxDistance', Math.max(100, Number(e.target.value) || 1000))}
              className="col-span-1 min-h-[38px] px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-center text-slate-100 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Param 3: Civilization Lifetime */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="param-max-lifetime" className="font-medium text-slate-200">
              อายุขัยเฉลี่ยของอารยธรรม (Lifetime)
            </label>
            <span className="text-cyan-400 font-bold font-tech text-xs">
              {params.maxLifetime.toLocaleString()} ปี
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 items-center">
            <input
              type="range"
              id="slider-max-lifetime"
              min="1000"
              max="2000000"
              step="5000"
              value={params.maxLifetime}
              onChange={(e) => updateParam('maxLifetime', Number(e.target.value))}
              className="col-span-3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <input
              type="number"
              id="param-max-lifetime"
              min="500"
              max="5000000"
              value={params.maxLifetime}
              onChange={(e) => updateParam('maxLifetime', Math.max(500, Number(e.target.value) || 1000))}
              className="col-span-1 min-h-[38px] px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-center text-slate-100 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Param 4: Tech Growth Rate */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="param-tech-growth" className="font-medium text-slate-200">
              อัตราการพัฒนาเทคโนโลยี (k)
            </label>
            <span className="text-cyan-400 font-bold font-tech text-xs">
              {params.techGrowthRate.toFixed(3)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 items-center">
            <input
              type="range"
              id="slider-tech-growth"
              min="0.001"
              max="0.050"
              step="0.001"
              value={params.techGrowthRate}
              onChange={(e) => updateParam('techGrowthRate', Number(e.target.value))}
              className="col-span-3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <input
              type="number"
              id="param-tech-growth"
              min="0.001"
              max="0.100"
              step="0.001"
              value={params.techGrowthRate}
              onChange={(e) => updateParam('techGrowthRate', Math.max(0.0001, Number(e.target.value) || 0.01))}
              className="col-span-1 min-h-[38px] px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-center text-slate-100 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Param 5: Technosignature Signal Lifetime */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="param-signal-lifetime" className="font-medium text-slate-200">
              ระยะเวลาส่ง Technosignature (Signal Lifetime)
            </label>
            <span className="text-cyan-400 font-bold font-tech text-xs">
              {params.signalLifetime.toLocaleString()} ปี
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 items-center">
            <input
              type="range"
              id="slider-signal-lifetime"
              min="100"
              max="100000"
              step="500"
              value={params.signalLifetime}
              onChange={(e) => updateParam('signalLifetime', Number(e.target.value))}
              className="col-span-3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <input
              type="number"
              id="param-signal-lifetime"
              min="50"
              max="500000"
              value={params.signalLifetime}
              onChange={(e) => updateParam('signalLifetime', Math.max(10, Number(e.target.value) || 1000))}
              className="col-span-1 min-h-[38px] px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-center text-slate-100 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Param 6: Signal Strength & Directionality & Detector Sensitivity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Signal Strength */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="param-signal-strength" className="font-medium text-slate-200">
                ความแรงสัญญาณ
              </label>
              <span className="text-cyan-400 font-bold font-tech">
                {params.signalStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              id="slider-signal-strength"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.signalStrength}
              onChange={(e) => updateParam('signalStrength', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Directionality */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="param-directionality" className="font-medium text-slate-200">
                ทิศทางการส่ง (Beaming)
              </label>
              <span className="text-cyan-400 font-bold font-tech">
                {params.directionality.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              id="slider-directionality"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.directionality}
              onChange={(e) => updateParam('directionality', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Detector Sensitivity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="param-detector-sensitivity" className="font-medium text-slate-200">
                ความไวเครื่องตรวจจับ
              </label>
              <span className="text-cyan-400 font-bold font-tech">
                {params.detectorSensitivity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              id="slider-detector-sensitivity"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.detectorSensitivity}
              onChange={(e) => updateParam('detectorSensitivity', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Technology Evolution Model Picker */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">โมเดลการพัฒนาเทคโนโลยี K(t)</span>
            <span className="text-indigo-400 font-bold text-xs">{currentFormula.title}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['logistic', 'exponential', 'linear'] as TechModelType[]).map((model) => (
              <button
                key={model}
                id={`tech-model-${model}`}
                type="button"
                onClick={() => updateParam('techModel', model)}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all min-h-[44px] flex items-center justify-center ${
                  params.techModel === model
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {model === 'logistic' && 'Logistic (S-Curve)'}
                {model === 'exponential' && 'Exponential'}
                {model === 'linear' && 'Linear (คงที่)'}
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-750 text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-tech font-bold text-indigo-300">{currentFormula.latex}</div>
              <div className="text-slate-400 mt-0.5">{currentFormula.desc}</div>
            </div>
          </div>
        </div>

        {/* Random Seed Control */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div>
            <div className="text-xs font-semibold text-slate-200">Random Seed (สร้างผลซ้ำ)</div>
            <div className="text-[11px] text-slate-400">ใส่ Seed เดิมเพื่อให้ผลการทดลองคงเดิม 100%</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="input-random-seed"
              value={params.seed}
              onChange={(e) => updateParam('seed', Number(e.target.value) || 1)}
              className="w-28 min-h-[42px] px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-cyan-300 text-center outline-none focus:border-cyan-400"
            />
            <button
              onClick={onRandomizeSeed}
              type="button"
              className="px-3 min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 text-xs font-semibold transition-colors shrink-0"
            >
              <Dices className="w-4 h-4 text-cyan-400" />
              <span>สุ่ม Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          id="btn-apply-and-start"
          onClick={onStartSimulation}
          disabled={isRunning}
          className="min-h-[48px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>เริ่มการทดลอง (Run Simulation)</span>
        </button>

        <button
          onClick={onResetDefaults}
          disabled={isRunning}
          className="min-h-[48px] py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>คืนค่าเริ่มต้น (Reset)</span>
        </button>
      </div>
    </div>
  );
};
