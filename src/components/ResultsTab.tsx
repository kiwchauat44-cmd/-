import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  Save,
  Trash2,
  Download,
  FileJson,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Upload,
  Search,
  Radio,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ExperimentRecord, SimulationParams, SimulationStats } from '../types/simulation';
import { downloadStandaloneHtml } from '../utils/exportStandaloneHtml';

interface ResultsTabProps {
  stats: SimulationStats | null;
  params: SimulationParams;
  onRunSimulation: () => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({ stats, params, onRunSimulation }) => {
  // Stored experiments for comparison
  const [savedExperiments, setSavedExperiments] = useState<ExperimentRecord[]>(() => {
    try {
      const stored = localStorage.getItem('seti_temporal_experiments');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Chart Canvas Refs for secondary charts
  const chart2Ref = useRef<HTMLCanvasElement | null>(null);
  const chart3Ref = useRef<HTMLCanvasElement | null>(null);
  const chart4Ref = useRef<HTMLCanvasElement | null>(null);
  const chart5Ref = useRef<HTMLCanvasElement | null>(null);
  const chart6Ref = useRef<HTMLCanvasElement | null>(null);

  // Save current experiment
  const handleSaveExperiment = () => {
    if (!stats) return;
    const newRecord: ExperimentRecord = {
      id: Date.now().toString(),
      name: `การทดลองที่ ${savedExperiments.length + 1} (${params.techModel})`,
      timestamp: new Date().toLocaleTimeString('th-TH'),
      params: { ...params },
      stats: { ...stats }
    };
    const updated = [newRecord, ...savedExperiments].slice(0, 8);
    setSavedExperiments(updated);
    try {
      localStorage.setItem('seti_temporal_experiments', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDeleteExperiment = (id: string) => {
    const updated = savedExperiments.filter((exp) => exp.id !== id);
    setSavedExperiments(updated);
    try {
      localStorage.setItem('seti_temporal_experiments', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleExportJson = () => {
    if (!stats) return;
    const exportData = {
      generatedAt: new Date().toISOString(),
      parameters: params,
      statistics: stats,
      savedHistory: savedExperiments
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seti-temporal-mismatch-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Recharts Line Chart Data: Detection Probability vs Distance
  const rechartsData = React.useMemo(() => {
    if (!stats?.distanceBins || stats.distanceBins.length === 0) return [];
    return stats.distanceBins.map((bin) => ({
      distance: bin.distance,
      distanceLabel: `${Math.round(bin.distance / 1000)}k ly`,
      probB: Math.round(bin.probB * 1000) / 1000,
      probA: Math.round(bin.probA * 1000) / 1000,
      probBPercent: Math.round(bin.probB * 1000) / 10,
      probAPercent: Math.round(bin.probA * 1000) / 10,
      mismatch: Math.round(bin.mismatch * 1000) / 1000,
      count: bin.count
    }));
  }, [stats]);

  // Render Canvas Charts with high DPI and responsive adjustments
  useEffect(() => {
    if (!stats) return;

    const dpr = window.devicePixelRatio || 1;

    const initCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 180 * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      return { ctx, w: rect.width, h: 180 };
    };

    // Chart 2: Temporal Mismatch vs Distance (ΔK)
    const c2 = initCanvas(chart2Ref.current);
    if (c2 && c2.ctx) {
      const { ctx, w, h } = c2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 15);
      ctx.lineTo(40, h - 30);
      ctx.lineTo(w - 15, h - 30);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Chakra Petch, Sarabun, sans-serif';
      ctx.fillText('0', 25, h - 30);
      ctx.fillText('1.0', 18, 22);
      ctx.fillText('ระยะทาง (ปีแสง)', w / 2 - 30, h - 10);

      const samples = stats.scatterSample || [];
      const maxD = params.maxDistance;
      ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const px = 40 + (s.distance / maxD) * (w - 60);
        const py = (h - 30) - s.mismatch * (h - 45);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (stats.distanceBins && stats.distanceBins.length > 0) {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let b = 0; b < stats.distanceBins.length; b++) {
          const bin = stats.distanceBins[b];
          const bx = 40 + (bin.distance / maxD) * (w - 60);
          const by = (h - 30) - bin.mismatch * (h - 45);
          if (b === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }
    }

    // Chart 3: Observed Tech vs Current Tech
    const c3 = initCanvas(chart3Ref.current);
    if (c3 && c3.ctx) {
      const { ctx, w, h } = c3;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(35, 15);
      ctx.lineTo(35, h - 30);
      ctx.lineTo(w - 15, h - 30);
      ctx.stroke();

      // Diagonal parity line (y = x)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(35, h - 30);
      ctx.lineTo(w - 15, 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Chakra Petch, Sarabun, sans-serif';
      ctx.fillText('0', 20, h - 30);
      ctx.fillText('1.0', 14, 22);
      ctx.fillText('Current Tech (K_cur)', w / 2 - 40, h - 10);

      const samples = stats.scatterSample || [];
      ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const px = 35 + s.currentTech * (w - 55);
        const py = (h - 30) - s.observedTech * (h - 45);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Chart 4: Detection Rate Bar Chart
    const c4 = initCanvas(chart4Ref.current);
    if (c4 && c4.ctx) {
      const { ctx, w, h } = c4;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      const maxRate = Math.max(stats.detectionRateA, stats.detectionRate, 5) * 1.2;
      const barW = Math.min(60, w * 0.22);
      const startX = w / 2 - barW - 20;

      // Bar Model A
      const hA = (stats.detectionRateA / maxRate) * (h - 60);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(startX, (h - 35) - hA, barW, hA);

      // Bar Model B
      const hB = (stats.detectionRate / maxRate) * (h - 60);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(startX + barW + 40, (h - 35) - hB, barW, hB);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Chakra Petch, Sarabun, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Model A`, startX + barW / 2, h - 18);
      ctx.fillText(`${stats.detectionRateA}%`, startX + barW / 2, (h - 42) - hA);

      ctx.fillText(`Model B`, startX + barW + 40 + barW / 2, h - 18);
      ctx.fillText(`${stats.detectionRate}%`, startX + barW + 40 + barW / 2, (h - 42) - hB);
      ctx.textAlign = 'left';
    }

    // Chart 5: Age Histogram
    const c5 = initCanvas(chart5Ref.current);
    if (c5 && c5.ctx) {
      const { ctx, w, h } = c5;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      const bins = stats.ageBins || [];
      const maxCount = Math.max(...bins.map((b) => b.count), 1);
      const padLeft = 35;
      const availW = w - padLeft - 15;
      const colW = availW / bins.length;

      for (let i = 0; i < bins.length; i++) {
        const b = bins[i];
        const barH = (b.count / maxCount) * (h - 55);
        const bx = padLeft + i * colW + 4;
        const by = (h - 30) - barH;

        ctx.fillStyle = '#818cf8';
        ctx.fillRect(bx, by, colW - 8, barH);

        ctx.fillStyle = '#64748b';
        ctx.font = '9px Chakra Petch, Sarabun, sans-serif';
        ctx.fillText(b.binLabel, bx - 2, h - 12);
      }
    }

    // Chart 6: Tech Level Distribution
    const c6 = initCanvas(chart6Ref.current);
    if (c6 && c6.ctx) {
      const { ctx, w, h } = c6;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      const bins = stats.techBins || [];
      let maxCount = 1;
      bins.forEach((b) => {
        if (b.countCurrent > maxCount) maxCount = b.countCurrent;
        if (b.countObserved > maxCount) maxCount = b.countObserved;
      });

      const padLeft = 35;
      const availW = w - padLeft - 15;
      const groupW = availW / bins.length;
      const barW = (groupW - 10) / 2;

      for (let i = 0; i < bins.length; i++) {
        const b = bins[i];
        const hCur = (b.countCurrent / maxCount) * (h - 55);
        const hObs = (b.countObserved / maxCount) * (h - 55);

        const xCur = padLeft + i * groupW + 2;
        const xObs = xCur + barW + 2;

        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(xCur, (h - 30) - hCur, barW, hCur);

        ctx.fillStyle = '#6366f1';
        ctx.fillRect(xObs, (h - 30) - hObs, barW, hObs);

        ctx.fillStyle = '#64748b';
        ctx.font = '9px Chakra Petch, Sarabun, sans-serif';
        ctx.fillText(b.binLabel, xCur, h - 12);
      }
    }
  }, [stats, params]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-cyan-400" />
        <h3 className="text-sm font-bold text-slate-200">ยังไม่มีข้อมูลผลการจำลอง</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          กดปุ่มด้านล่างเพื่อเริ่มการจำลองจักรวาลและคำนวณสถิติ
        </p>
        <button
          onClick={onRunSimulation}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors min-h-[44px]"
        >
          เริ่มการจำลองเดี๋ยวนี้
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Overview Metric Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 rounded-2xl p-3.5 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 font-tech">
              ผลการทดสอบสมมติฐาน Temporal Mismatch
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300">
            N = {stats.totalCivilizations.toLocaleString()} อารยธรรม
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          ผลลัพธ์จากการจำลองเผยให้เห็นว่า ความล่าช้าของความเร็วแสง (Light Travel Time) ส่งผลให้อัตราการตรวจพบ
          Technosignature ลดลงจาก <b>{stats.detectionRateA}%</b> (สมมติว่าไม่มีความล่าช้า) เหลือเพียง{' '}
          <b className="text-emerald-400">{stats.detectionRate}%</b> (คิดความล่าช้าจริง) ลดลง{' '}
          <span className="text-rose-400 font-bold">-{stats.detectionReduction}%</span>
        </p>
      </div>

      {/* Model A vs Model B Direct Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block mb-0.5">Model A (No Light Delay)</span>
          <div className="text-lg font-bold text-cyan-400 font-tech">
            {stats.detectedCountA.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {stats.detectionRateA}% จากทั้งหมด
          </span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-3">
          <span className="text-[11px] text-emerald-400 block mb-0.5">Model B (Real Delay)</span>
          <div className="text-lg font-bold text-emerald-400 font-tech">
            {stats.detectedCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-300/80 font-mono">
            {stats.detectionRate}% ตรวจพบจริง
          </span>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-3">
          <span className="text-[11px] text-rose-400 block mb-0.5">Detection Reduction</span>
          <div className="text-lg font-bold text-rose-400 font-tech">
            -{stats.detectionReduction}%
          </div>
          <span className="text-[10px] text-rose-300/80 font-mono">
            ลดลง {stats.detectionReductionAbs.toFixed(2)}% จุด
          </span>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-3">
          <span className="text-[11px] text-amber-400 block mb-0.5">Avg Temporal Mismatch</span>
          <div className="text-lg font-bold text-amber-400 font-tech">
            ΔK = {stats.avgTemporalMismatch}
          </div>
          <span className="text-[10px] text-amber-300/80 font-mono">
            สูงสุด: {stats.maxTemporalMismatch}
          </span>
        </div>
      </div>

      {/* PRIMARY FEATURE: Recharts Line Chart for Detection Probability vs Distance */}
      <div className="bg-slate-900/95 border border-cyan-800/60 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-tech">
              Detection Probability vs Distance (Recharts Interactive Visualization)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-cyan-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Model B (Real Delay)
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2.5 h-0.5 bg-amber-400" />
              Model A (Instant)
            </span>
          </div>
        </div>

        {/* Responsive Recharts Container */}
        <div className="w-full h-64 sm:h-72 -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rechartsData}
              margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
              <XAxis
                dataKey="distanceLabel"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 1]}
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#0284c7',
                  borderRadius: '10px',
                  fontSize: '11px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)'
                }}
                labelStyle={{ color: '#7dd3fc', fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any, name: any) => {
                  const num = Number(value);
                  if (name.includes('Model B')) {
                    return [`${(num * 100).toFixed(1)}% (ความน่าจะเป็นจริง)`, 'Model B (มี Light Delay)'];
                  }
                  if (name.includes('Model A')) {
                    return [`${(num * 100).toFixed(1)}% (สมมติทันที)`, 'Model A (Instantaneous)'];
                  }
                  return [num, name];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(val) => <span className="text-slate-300">{val}</span>}
              />
              <Line
                type="monotone"
                dataKey="probB"
                name="Model B (มี Light Delay จริง)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: '#7dd3fc' }}
              />
              <Line
                type="monotone"
                dataKey="probA"
                name="Model A (สมมติไม่มีความล่าช้า)"
                stroke="#eab308"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#eab308' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
          <b className="text-cyan-300">การวิเคราะห์:</b> กราฟ Recharts ด้านบนคำนวณจากข้อมูลจริงจำลองแบ่งตามช่วงระยะทาง (Distance Bins)
          เมื่อระยะทางเกินกว่า 20,000 ปีแสง เส้นสีฟ้า (Model B) จะลดลงต่ำกว่าเส้นสีเหลืองประ (Model A) อย่างชัดเจน
          สะท้อนถึงการลดทอนของคลื่นและการที่แสงในอดีตมาถึงโลกในขณะที่อารยธรรมในยุคนั้นยังมีเทคโนโลยีไม่เพียงพอที่จะส่งสัญญาณข้ามห้วงอวกาศ
        </p>
      </div>

      {/* Multi-Round Search Results Table (Round 1, 2, 3, 4...) */}
      {stats.searchRoundsHistory && stats.searchRoundsHistory.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-tech">
                ผลการค้นหาแบบหลายรอบ (Multi-Round Search Results)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              กลยุทธ์: {params.searchStrategy || 'Radial Search'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-2">รอบที่</th>
                  <th className="py-2 px-2">รัศมีค้นหา</th>
                  <th className="py-2 px-2">ดาวสแกน</th>
                  <th className="py-2 px-2">อารยธรรมสแกน</th>
                  <th className="py-2 px-2 text-emerald-400">ตรวจพบ</th>
                  <th className="py-2 px-2 text-rose-400">ล่มสลาย</th>
                  <th className="py-2 px-2 text-purple-400">วิวัฒนาการ</th>
                  <th className="py-2 px-2 text-amber-400">Avg ΔK</th>
                  <th className="py-2 px-2 text-cyan-400">อัตราตรวจพบ</th>
                  <th className="py-2 px-2 text-right">สะสม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {stats.searchRoundsHistory.map((round) => (
                  <tr key={round.roundNumber} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2 font-bold text-slate-200">
                      Round {round.roundNumber}
                    </td>
                    <td className="py-2 px-2 text-slate-300">
                      {Math.round(round.searchRadius / 1000)}k ly
                    </td>
                    <td className="py-2 px-2 text-slate-400">
                      {round.starsScanned.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-slate-300">
                      {round.civsScanned.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-emerald-400 font-semibold">
                      {round.detectedCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-rose-400">
                      {round.collapsedCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-purple-400">
                      {round.evolvedCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-amber-400">
                      {round.avgTemporalMismatch}
                    </td>
                    <td className="py-2 px-2 text-cyan-400 font-semibold">
                      {round.detectionRate}%
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-300 font-bold">
                      {round.cumulativeDetectionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400">
            * ตัวเลขทั้งหมดคำนวณจาก Simulation Engine ตามขนาดของ Search Wavefront ที่ขยายตัวในแต่ละรอบ
          </p>
        </div>
      )}

      {/* Miss Reasons Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-tech">
          สาเหตุที่อารยธรรมไม่ถูกตรวจพบใน Model B (Miss Reasons Breakdown)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            แสงยังไม่ถึง: <b className="text-slate-200">{stats.missNotReached.toLocaleString()}</b>
          </div>
          <div className="text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            สัญญาณผ่านไปแล้ว: <b className="text-slate-200">{stats.missPassed.toLocaleString()}</b>
          </div>
          <div className="text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            ยุคนั้นเทคโนโลยีต่ำ: <b className="text-slate-200">{stats.missLowTech.toLocaleString()}</b>
          </div>
          <div className="text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            สัญญาณจาง/เปลี่ยนคลื่น: <b className="text-slate-200">{stats.missTooFaint.toLocaleString()}</b>
          </div>
        </div>
      </div>

      {/* Additional Deep Dive Canvas Charts */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-slate-100 px-1 font-tech">
          กราฟวิเคราะห์เชิงลึกเพิ่มเติม (Canvas High-DPI Charts)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Chart 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>1. Temporal Mismatch vs Distance</span>
              <span className="text-[10px] text-amber-400">ΔK vs Distance</span>
            </div>
            <canvas ref={chart2Ref} className="w-full rounded-lg block" />
            <p className="text-[10px] text-slate-400 mt-1.5">
              ยิ่งอารยธรรมอยู่ไกลมาก ความเหลื่อมล้ำระหว่างสถานะจริงกับภาพที่โลกเห็น (Temporal Mismatch) ยิ่งถ่างกว้าง
            </p>
          </div>

          {/* Chart 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>2. Observed Tech vs Current Tech</span>
              <span className="text-[10px] text-rose-400">K_obs vs K_cur</span>
            </div>
            <canvas ref={chart3Ref} className="w-full rounded-lg block" />
            <p className="text-[10px] text-slate-400 mt-1.5">
              จุดที่ตกลงมาใต้เส้นทแยงมุมแสดงถึงความล่าช้า: เราเห็นเทคโนโลยีในอดีตที่ด้อยกว่าความเป็นจริงในปัจจุบัน
            </p>
          </div>

          {/* Chart 4 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>3. Detection Rate Comparison</span>
              <span className="text-[10px] text-emerald-400">Model A vs B</span>
            </div>
            <canvas ref={chart4Ref} className="w-full rounded-lg block" />
            <p className="text-[10px] text-slate-400 mt-1.5">
              เปรียบเทียบตรง: หากปราศจากความล่าช้าของแสง (Model A) กับเมื่อนำ Light Travel Time มาคำนวณจริง (Model B)
            </p>
          </div>

          {/* Chart 5 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>4. Civilization Age Distribution</span>
              <span className="text-[10px] text-indigo-400">Age Histogram</span>
            </div>
            <canvas ref={chart5Ref} className="w-full rounded-lg block" />
            <p className="text-[10px] text-slate-400 mt-1.5">
              การกระจายตัวของอายุอารยธรรมในจักรวาลจำลอง
            </p>
          </div>

          {/* Chart 6 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm sm:col-span-2">
            <div className="text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>5. Technology Level Distribution</span>
              <span className="text-[10px] text-slate-400">
                <span className="text-rose-400 font-bold">■ Current</span> vs{' '}
                <span className="text-indigo-400 font-bold">■ Observed</span>
              </span>
            </div>
            <canvas ref={chart6Ref} className="w-full rounded-lg block" />
            <p className="text-[10px] text-slate-400 mt-1.5">
              เปรียบเทียบการกระจายตัวของระดับเทคโนโลยี: สัญญาณที่โลกตรวจจับได้มักเอียงไปทางเทคโนโลยีระดับต่ำกว่า
            </p>
          </div>
        </div>
      </div>

      {/* Experiment Comparison & History Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-tech">
              ระบบบันทึกและเปรียบเทียบการทดลอง (Experiment Comparison)
            </h3>
          </div>
          <button
            onClick={handleSaveExperiment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors min-h-[36px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกผลครั้งนี้</span>
          </button>
        </div>

        {savedExperiments.length > 0 ? (
          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-2">ชื่อการทดลอง</th>
                  <th className="py-2 px-2">เวลา</th>
                  <th className="py-2 px-2">Model A</th>
                  <th className="py-2 px-2">Model B</th>
                  <th className="py-2 px-2">Reduction</th>
                  <th className="py-2 px-2 text-right">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {savedExperiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-2 font-sans font-medium text-slate-200">
                      {exp.name}
                    </td>
                    <td className="py-2 px-2 text-slate-400">{exp.timestamp}</td>
                    <td className="py-2 px-2 text-cyan-400">{exp.stats.detectionRateA}%</td>
                    <td className="py-2 px-2 text-emerald-400">{exp.stats.detectionRate}%</td>
                    <td className="py-2 px-2 text-rose-400">-{exp.stats.detectionReduction}%</td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => handleDeleteExperiment(exp.id)}
                        className="p-1 rounded hover:bg-rose-950 text-rose-400 transition-colors"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            ยังไม่มีประวัติการทดลองที่บันทึกไว้ กด "บันทึกผลครั้งนี้" เพื่อเปรียบเทียบผลการทดลองในพารามิเตอร์ต่างๆ
          </p>
        )}

        {/* Action buttons: Export JSON and Download Single File HTML */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors min-h-[42px]"
          >
            <FileJson className="w-4 h-4 text-cyan-400" />
            <span>Export ข้อมูลเป็น JSON</span>
          </button>

          <button
            onClick={() => downloadStandaloneHtml(params)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700 text-xs font-semibold transition-colors min-h-[42px]"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>ดาวน์โหลด Standalone index.html สำหรับ Android</span>
          </button>
        </div>
      </div>
    </div>
  );
};
