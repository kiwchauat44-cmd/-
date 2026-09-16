import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Dices,
  RefreshCw,
  StepForward,
  Radio,
  Eye,
  Info,
  Layers,
  Globe2,
  Compass,
  Search,
  Sparkles
} from 'lucide-react';
import {
  Civilization,
  Galaxy,
  Star,
  SimulationParams,
  SimulationStats
} from '../types/simulation';
import { Universe3DCanvas } from './Universe3DCanvas';

interface ExperimentTabProps {
  civilizations: Civilization[];
  galaxies?: Galaxy[];
  stars?: Star[];
  stats: SimulationStats | null;
  params: SimulationParams;
  isRunning: boolean;
  progressPercent: number;
  progressCount: number;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
  onRandomizeSeedAndRun: () => void;
  onSelectCivilization: (civ: Civilization) => void;
}

export const ExperimentTab: React.FC<ExperimentTabProps> = ({
  civilizations,
  galaxies = [],
  stars = [],
  stats,
  params,
  isRunning,
  progressPercent,
  progressCount,
  onStartSimulation,
  onStopSimulation,
  onResetSimulation,
  onRandomizeSeedAndRun,
  onSelectCivilization
}) => {
  // View mode switcher: 3D Universe vs 2D Radar
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // 2D Canvas Viewport State (Zoom & Pan)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation Controls for 2D View
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const waveTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Available speed options
  const speeds = [0.5, 1, 2, 5, 10, 50, 100];

  // 2D Zoom handlers
  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.4, Math.min(6.0, prev * factor)));
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleStep = () => {
    waveTimeRef.current += 1500 * speedMultiplier;
  };

  // 2D Touch / Mouse drag pan logic
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  // 2D Click on Canvas to select civilization
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || civilizations.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cx = canvas.width / (2 * (window.devicePixelRatio || 1)) + pan.x;
    const cy = canvas.height / (2 * (window.devicePixelRatio || 1)) + pan.y;
    const maxRadius = (Math.min(canvas.width, canvas.height) / (2 * (window.devicePixelRatio || 1)) - 30) * zoom;

    let closestCiv: Civilization | null = null;
    let minDistanceSq = 25 * 25; // 25px tap threshold

    const sampleLimit = Math.min(10000, civilizations.length);
    for (let i = 0; i < sampleLimit; i++) {
      const civ = civilizations[i];
      const r = (civ.distance / params.maxDistance) * maxRadius;
      const x = cx + Math.cos(civ.angle) * r;
      const y = cy + Math.sin(civ.angle) * r;

      const dSq = (x - clickX) * (x - clickX) + (y - clickY) * (y - clickY);
      if (dSq < minDistanceSq) {
        minDistanceSq = dSq;
        closestCiv = civ;
      }
    }

    if (closestCiv) {
      onSelectCivilization(closestCiv);
    }
  };

  // 2D Canvas Rendering Loop (Runs only when viewMode === '2d')
  useEffect(() => {
    if (viewMode !== '2d') return;

    let isCancelled = false;

    const render = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth || 360;
      const height = Math.max(340, Math.min(520, width * 1.05));

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#0a1020');
      bgGrad.addColorStop(1, '#040711');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + pan.x;
      const cy = height / 2 + pan.y;
      const maxRadius = (Math.min(width, height) / 2 - 30) * zoom;

      // 1. Radar Grid Circles
      ctx.lineWidth = 1;
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((ratio) => {
        ctx.strokeStyle = ratio === 1.0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(30, 41, 59, 0.8)';
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px Chakra Petch, sans-serif';
        const distLabel = `${Math.round((params.maxDistance * ratio) / 1000)}k ly`;
        ctx.fillText(distLabel, cx + 6, cy - maxRadius * ratio + 12);
      });

      // 2. Expanding Search Wave
      if (!isPaused && !isRunning) {
        waveTimeRef.current += 16 * speedMultiplier;
      }
      const waveCyclePeriod = 12000;
      const waveProgress = (waveTimeRef.current % waveCyclePeriod) / waveCyclePeriod;
      const waveRadius = waveProgress * maxRadius;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Render Civilizations
      const sampleSize = Math.min(civilizations.length, 10000);
      for (let i = 0; i < sampleSize; i++) {
        const civ = civilizations[i];
        const r = (civ.distance / params.maxDistance) * maxRadius;
        const x = cx + Math.cos(civ.angle) * r;
        const y = cy + Math.sin(civ.angle) * r;

        if (civ.detected) {
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, y, 6.5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (civ.temporalMismatch > 0.4) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
          ctx.beginPath();
          ctx.arc(x, y, 2.0, 0, Math.PI * 2);
          ctx.fill();
        } else if (civ.currentState === 'active') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Earth at the Center
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const earthRipple = (waveTimeRef.current * 0.4) % 35;
      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1 - earthRipple / 35)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRipple + 5.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 11px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('โลก (Earth / SETI)', cx, cy + 18);
      ctx.textAlign = 'left';

      ctx.restore();

      if (!isCancelled) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [civilizations, zoom, pan, isPaused, speedMultiplier, isRunning, params, viewMode]);

  return (
    <div className="space-y-3 pb-12 max-w-4xl mx-auto">
      {/* Simulation Status & Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? 'bg-amber-400 animate-ping'
                  : stats?.detectedCount
                  ? 'bg-emerald-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="font-semibold text-slate-200">
              {isRunning
                ? `กำลังคำนวณจำลองจักรวาล 3D... (${progressCount.toLocaleString()} / ${params.civCount.toLocaleString()})`
                : stats
                ? `จำลองเสร็จสมบูรณ์: ตรวจพบ ${stats.detectedCount.toLocaleString()} / ${stats.totalCivilizations.toLocaleString()} แห่ง (${stats.detectionRate}%)`
                : 'พร้อมเริ่มการทดลอง'}
            </span>
          </div>

          {/* View Mode Toggle: 3D Universe vs 2D Radar */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>3D Universe</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2D Radar</span>
            </button>
          </div>
        </div>

        {isRunning && (
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Simulation Viewport: 3D Canvas or 2D Radar */}
      {viewMode === '3d' ? (
        <Universe3DCanvas
          civilizations={civilizations}
          galaxies={galaxies}
          stars={stars}
          stats={stats}
          params={params}
          onSelectCivilization={onSelectCivilization}
          isRunning={isRunning}
        />
      ) : (
        <div
          ref={containerRef}
          className="relative w-full bg-[#060913] rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl flex items-center justify-center min-h-[340px] sm:min-h-[420px]"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleCanvasClick}
            className="cursor-grab active:cursor-grabbing block touch-none"
          />

          {/* Viewport Floating Controls (Zoom, Pan Reset) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => handleZoom(1.25)}
              title="ซูมเข้า (+)"
              className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 flex items-center justify-center shadow-md transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              title="ซูมออก (-)"
              className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 flex items-center justify-center shadow-md transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="รีเซ็ตมุมมองตรงกลาง"
              className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shadow-md transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Touch Hint Overlay */}
          <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none">
            <span className="text-[10px] text-slate-400/80 bg-slate-950/70 px-2 py-0.5 rounded-md border border-slate-800/80 backdrop-blur-xs">
              แตะที่จุดอารยธรรมเพื่อดูข้อมูล • ลากเพื่อเลื่อน
            </span>
          </div>
        </div>
      )}

      {/* Simulation Playback, Speed & Search Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-3">
        {/* Main Action Control Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {isRunning ? (
            <button
              onClick={onStopSimulation}
              className="min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>หยุดการจำลอง</span>
            </button>
          ) : (
            <button
              onClick={onStartSimulation}
              className="min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>เริ่มการทดลองใหม่</span>
            </button>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            disabled={isRunning}
            className="min-h-[44px] py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'ดำเนินการต่อ' : 'Pause'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={isRunning}
            className="min-h-[44px] py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step 1 เฟรม</span>
          </button>

          <button
            onClick={onRandomizeSeedAndRun}
            disabled={isRunning}
            className="min-h-[44px] py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Dices className="w-3.5 h-3.5 text-cyan-400" />
            <span>สุ่มใหม่ (New Seed)</span>
          </button>
        </div>

        {/* Speed Adjustment Bar (for 2D radar) */}
        {viewMode === '2d' && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
            <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
              ความเร็วคลื่นแสง (2D):
            </span>
            <div className="flex items-center gap-1">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    speedMultiplier === s
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-xs">
        <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>คำอธิบายสัญลักษณ์บนสนามจำลองจักรวาล</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 shrink-0" />
            <span>โลก (Earth / SETI)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/50 shrink-0" />
            <span className="font-semibold text-yellow-300">ตรวจพบ (Detected)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
            <span>พลาดจากความล่าช้าแสง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
            <span>ดับสูญ / สัญญาณจาง</span>
          </div>
        </div>
      </div>
    </div>
  );
};
