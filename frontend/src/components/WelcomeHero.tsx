'use client';

import React from 'react';
import {
  Sparkles,
  Upload,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Hexagon
} from 'lucide-react';

interface WelcomeHeroProps {
  onLoadSample: () => void;
  onOpenUpload: () => void;
  isLoading: boolean;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onLoadSample,
  onOpenUpload,
  isLoading
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#FAFBFF]">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#5932EA]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#16C098]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Agency Icon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5932EA]/10 border border-[#5932EA]/20 text-[#5932EA] text-xs font-bold mb-6">
          <Hexagon className="w-4 h-4 fill-[#5932EA]/20" />
          <span>tentwenty · Engineering Take-Home</span>
        </div>

        {/* Core Question Headline from Assignment Brief */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] tracking-tight max-w-2xl mx-auto leading-tight">
          &ldquo;did we actually make money on that project?&rdquo;
        </h1>

        {/* The Two Prominent Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {/* Button 1: Load Sample Data */}
          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="w-full sm:w-auto px-7 py-4 bg-[#5932EA] hover:bg-[#4a27ce] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#5932EA]/25 transition-all flex items-center justify-center gap-2.5 group cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Load Sample 2025 Data</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 2: Upload Spreadsheets */}
          <button
            onClick={onOpenUpload}
            disabled={isLoading}
            className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload Spreadsheets (.xlsx)</span>
          </button>
        </div>

        {/* Feature Pills Strip */}
        <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F9FBFF]">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">3 Messy Sheets</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Timesheet, Salaries, Project Prices</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F9FBFF]">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">Zero Double-Count</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">0.00 AED drift against salaries</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F9FBFF]">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">Full Drill-Down</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Department & per-person margin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
