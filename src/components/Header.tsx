import React from 'react';
import { Sparkles, Download, RefreshCw } from 'lucide-react';
import { SimulationStats } from '../types/simulation';

interface HeaderProps {
  stats: SimulationStats | null;
  isRunning: boolean;
  onDownloadStandalone: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  isRunning,
  onDownloadStandalone,
  onReset
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-cyan-300 font-tech tracking-wide truncate">
              Temporal Mismatch Simulation
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 hidden xs:inline-block">
              SETI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
            จำลองผลของระยะทาง ความล่าช้าของแสง การพัฒนาเทคโนโลยี และหน้าต่างเวลาการตรวจจับอารยธรรมต่างดาว
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onDownloadStandalone}
            title="ดาวน์โหลดไฟล์เดี่ยว Standalone HTML สำหรับเปิดบน Android ทันที"
            aria-label="ดาวน์โหลดไฟล์เดี่ยว HTML"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ไฟล์เดี่ยว HTML</span>
          </button>
          
          <button
            onClick={onReset}
            disabled={isRunning}
            title="รีเซ็ตเป็นค่าเริ่มต้น"
            aria-label="รีเซ็ตเป็นค่าเริ่มต้น"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
