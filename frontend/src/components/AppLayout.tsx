'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { WelcomeHero } from './WelcomeHero';
import { ParsingProgress } from './ParsingProgress';
import { UploadModal } from './UploadModal';
import { SettingsModal } from './SettingsModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { AuditModal } from './AuditModal';
import { useData } from '../context/DataContext';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    metrics,
    hasData,
    isProcessing,
    handleLoadSample,
    handleResetData,
    handleUploadSuccess,
    isUploadOpen,
    setIsUploadOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isAuditOpen,
    setIsAuditOpen,
    selectedProject,
    setSelectedProject
  } = useData();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFBFF] text-[#111827] flex font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 sm:p-8 bg-[#FAFBFF]">
        {isProcessing ? (
          <ParsingProgress />
        ) : !hasData ? (
          <WelcomeHero
            onLoadSample={handleLoadSample}
            onOpenUpload={() => setIsUploadOpen(true)}
            isLoading={isProcessing}
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
                  Hello Leadership 👋,
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Financial Margin & Commercial Performance Dashboard
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetData}
                  title="Clear data to view welcome hero screen"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Reset Screen</span>
                </button>

                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#5932EA]" />
                  <span className="text-slate-400 font-normal">Period:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-900 font-bold"
                  >
                    <option value="all">Full Year 2025</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsAuditOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#008767] bg-[#16C098]/10 hover:bg-[#16C098]/20 border border-[#00B087]/20 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008767]" />
                  <span>0.00 AED Audit</span>
                </button>
              </div>
            </div>

            {metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 flex-shrink-0">
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#D3FFE7] text-[#00AC4F] flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Total Revenue</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#333333] tracking-tight mt-0.5">
                      AED {metrics.totalRevenue.toLocaleString()}
                    </h3>
                    <span className="text-[11px] text-[#00AC4F] font-bold flex items-center gap-0.5 mt-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      {metrics.projectCount} commercial projects
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#E7EDFF] text-[#5932EA] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Total Project Cost</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#333333] tracking-tight mt-0.5">
                      AED {metrics.totalCost.toLocaleString()}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                      Direct + Indirect Recovered
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#E5F9FF] text-[#00B087] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Gross Margin</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#00AC4F] tracking-tight mt-0.5">
                      {metrics.grossMarginPercent}%
                    </h3>
                    <span className="text-[11px] text-[#00AC4F] font-bold flex items-center gap-0.5 mt-0.5">
                      Profit: AED {metrics.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFF0EB] text-[#FF6A55] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Billable Productivity</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#333333] tracking-tight mt-0.5">
                      {metrics.billableHoursPercent}%
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                      {metrics.billableHours.toLocaleString()} / {metrics.totalHours.toLocaleString()} hrs
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {children}
            </div>
          </>
        )}
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => window.location.reload()}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </div>
  );
};
