'use client';

import React from 'react';
import { CategoryItem } from '../types/dashboard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RightRailProps {
  categories: CategoryItem[];
  totalHours: number;
  onOpenAudit: () => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  categories,
  totalHours,
  onOpenAudit
}) => {
  // Color palette for category progress bars matching the screenshot
  const barColors = [
    'bg-[#10b981]', // emerald / teal
    'bg-[#06b6d4]', // cyan
    'bg-[#f59e0b]', // amber
    'bg-[#ef4444]', // red
    'bg-[#8b5cf6]', // violet
    'bg-[#3b82f6]', // blue
    'bg-[#ec4899]'  // pink
  ];

  return (
    <div className="w-full lg:w-80 flex flex-col justify-between space-y-8 pl-0 lg:pl-8 lg:border-l lg:border-slate-100">
      {/* Category Breakdown (Where does time go?) */}
      <div>
        <h3 className="text-lg font-bold text-[#141517] tracking-tight mb-6">
          Where does time go?
        </h3>

        <div className="space-y-5">
          {categories.slice(0, 6).map((cat, idx) => {
            const barColor = barColors[idx % barColors.length];
            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#374151] truncate max-w-[170px]">
                    {cat.category}
                  </span>
                  <span className="text-[#111827] font-mono">
                    {cat.hours.toLocaleString()} hrs
                  </span>
                </div>

                {/* Slim progress bar */}
                <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(8, cat.sharePercent))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Callout Card matching "Save more money" widget */}
      <div className="bg-[#edf4fe] rounded-3xl p-5 border border-[#dbe7f9] relative overflow-hidden">
        {/* Decorative graphic illustration */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Zero Drift
          </span>
        </div>

        <h4 className="text-sm font-bold text-[#111827]">
          Zero-Overhead Reconciled
        </h4>
        <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">
          Agency total project cost matches staff salaries to the dirham without double-counting.
        </p>

        <button
          onClick={onOpenAudit}
          className="mt-4 w-full py-2.5 px-4 bg-[#141517] hover:bg-[#23252a] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wide"
        >
          <span>View Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
