import React from 'react';
import { X, CheckCircle2, AlertTriangle, Radio, Sparkles, Orbit, Clock, ShieldAlert } from 'lucide-react';
import { Civilization } from '../types/simulation';

interface CivilizationBottomSheetProps {
  civilization: Civilization | null;
  onClose: () => void;
}

export const CivilizationBottomSheet: React.FC<CivilizationBottomSheetProps> = ({
  civilization,
  onClose
}) => {
  if (!civilization) return null;

  const {
    id,
    distance,
    lightTravelTime,
    civilizationAge,
    civilizationLifetime,
    currentState,
    observedState,
    currentTechnology,
    observedTechnology,
    temporalMismatch,
    detectionProbability,
    detectionProbabilityA,
    detected,
    detectedA,
    signalStrength,
    directionality,
    missReason
  } = civilization;

  const stateLabels: Record<string, { label: string; color: string }> = {
    not_born: { label: 'ยังไม่ถือกำเนิด', color: 'text-slate-400 bg-slate-800/80 border-slate-700' },
    active: { label: 'กำลังรุ่งเรืองและส่งสัญญาณ', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' },
    extinct: { label: 'ดับสูญ/ล่มสลายแล้ว', color: 'text-rose-400 bg-rose-950/40 border-rose-800' },
    not_reached: { label: 'แสงยังมาไม่ถึงโลก', color: 'text-amber-400 bg-amber-950/40 border-amber-800' },
    extinct_visible: { label: 'เห็นในอดีต (ปัจจุบันสูญสิ้นแล้ว)', color: 'text-purple-400 bg-purple-950/40 border-purple-800' },
    signal_passed: { label: 'สัญญาณผ่านโลกไปแล้ว', color: 'text-slate-400 bg-slate-800 border-slate-700' }
  };

  return (
    <div
      id="civilization-bottom-sheet-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        id="civilization-bottom-sheet-panel"
        className="w-full max-w-xl mx-auto bg-[#0d1424] border-t-2 border-cyan-500 rounded-t-2xl shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar with drag handle look and close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700 flex items-center justify-center text-cyan-300 font-bold text-xs font-tech">
              #{id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  อารยธรรม #{id}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    detected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {detected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> ตรวจพบ (Detected)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3" /> ตรวจไม่พบ (Missed)
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                พิกัดระยะห่าง {distance.toLocaleString()} ปีแสงจากโลก
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="ปิดรายละเอียดอารยธรรม"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason Banner */}
        <div
          className={`mt-3 p-2.5 rounded-xl border text-xs leading-relaxed ${
            detected
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
          }`}
        >
          <div className="font-semibold flex items-center gap-1.5 mb-0.5">
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>คำอธิบายผลการสังเกตการณ์:</span>
          </div>
          <p className="text-[11px] pl-5">{missReason}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          {/* Distance & Light Travel Time */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Orbit className="w-3 h-3 text-cyan-400" />
              <span>ระยะทาง (Distance)</span>
            </div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5 font-tech">
              {distance.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ปีแสง</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>Light Travel Time (τ)</span>
            </div>
            <div className="text-sm font-bold text-sky-300 mt-0.5 font-tech">
              {lightTravelTime.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ปี</span>
            </div>
          </div>

          {/* Current State vs Observed State */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400">สถานะจริงในปัจจุบัน</div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${
                  stateLabels[currentState]?.color || 'text-slate-300 bg-slate-800'
                }`}
              >
                {stateLabels[currentState]?.label || currentState}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              อายุ: {civilizationAge.toLocaleString()} / {civilizationLifetime.toLocaleString()} ปี
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400">สถานะที่โลกสังเกตเห็น</div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${
                  stateLabels[observedState]?.color || 'text-slate-300 bg-slate-800'
                }`}
              >
                {stateLabels[observedState]?.label || observedState}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              (ภาพจากอดีตเมื่อ {lightTravelTime.toLocaleString()} ปีก่อน)
            </div>
          </div>

          {/* Technology Levels */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400">Current Technology K(t)</div>
            <div className="text-sm font-bold text-rose-400 mt-0.5 font-tech">
              {(currentTechnology * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, currentTechnology * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400">Observed Technology K(t - τ)</div>
            <div className="text-sm font-bold text-indigo-400 mt-0.5 font-tech">
              {(observedTechnology * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${Math.min(100, observedTechnology * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Temporal Mismatch Highlight */}
        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-orange-950/30 border border-amber-700/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">
              ความเหลื่อมล้ำทางเวลา (Temporal Mismatch)
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Current Tech − Observed Tech = ΔK
            </div>
          </div>
          <div className="text-base font-extrabold text-amber-300 font-tech">
            +{(temporalMismatch * 100).toFixed(1)}%
          </div>
        </div>

        {/* Comparison: Model A vs Model B Detection Probabilities */}
        <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>เปรียบเทียบโอกาสตรวจพบ (Detection Probability)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <div className="text-[10px] text-slate-400">Model A (ไม่มีความล่าช้า)</div>
              <div className="text-sm font-bold text-cyan-400 font-tech">
                {(detectionProbabilityA * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {detectedA ? '✓ ตรวจพบ' : '✗ ไม่พบ'}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-800/60 border border-cyan-800/60 bg-cyan-950/20">
              <div className="text-[10px] text-cyan-300 font-medium">Model B (Temporal Mismatch จริง)</div>
              <div className="text-sm font-bold text-emerald-400 font-tech">
                {(detectionProbability * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {detected ? '✓ ตรวจพบ' : '✗ ไม่พบ'}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-3.5 w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors min-h-[44px]"
        >
          ปิดหน้าต่างนี้
        </button>
      </div>
    </div>
  );
};
