import React from 'react';
import { Sliders, Telescope, BarChart3, BookOpen } from 'lucide-react';

export type ActiveTab = 'settings' | 'experiment' | 'results' | 'info';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  detectedCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  detectedCount
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'settings',
      label: 'ตั้งค่า',
      icon: <Sliders className="w-4 h-4" />
    },
    {
      id: 'experiment',
      label: 'การทดลอง',
      icon: <Telescope className="w-4 h-4" />
    },
    {
      id: 'results',
      label: 'ผลลัพธ์',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: detectedCount !== undefined ? detectedCount : undefined
    },
    {
      id: 'info',
      label: 'ข้อมูลโมเดล',
      icon: <BookOpen className="w-4 h-4" />
    }
  ];

  return (
    <nav
      id="main-navigation"
      aria-label="การนำทางหลัก"
      className="sticky top-[53px] z-30 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800/90 shadow-sm"
    >
      <div className="max-w-4xl mx-auto flex items-stretch">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              aria-selected={isActive}
              aria-label={`แท็บ ${tab.label}`}
              className={`flex-1 min-h-[46px] py-2 px-1.5 flex flex-col items-center justify-center gap-1 text-xs font-semibold relative transition-all duration-150 select-none ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-1 relative">
                {tab.icon}
                <span className="text-[12px] sm:text-[13px] whitespace-nowrap">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded-full font-bold leading-tight ${
                      Number(tab.badge) > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 shadow-sm shadow-cyan-400/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
