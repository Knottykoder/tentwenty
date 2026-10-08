'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { WelcomeHero } from './WelcomeHero';
import { ParsingProgress } from './ParsingProgress';
import { UploadModal } from './UploadModal';
import { SettingsModal } from './SettingsModal';
import { AuditModal } from './AuditModal';
import { AnimatedMetricNumber } from './AnimatedMetricNumber';
import { useData } from '../context/DataContext';
import {
  Clock,
  ShieldCheck,
  Briefcase,
  DollarSign,
  TrendingUp,
  Calendar,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
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

  const pathname = usePathname();
  const isDashboard = pathname === '/';

  const pageHeaders: Record<string, { title: string; subtitle: string }> = {
    '/': {
      title: 'Hello Leadership 👋,',
      subtitle: 'Executive Margin & Commercial Profitability Dashboard'
    },
    '/projects': {
      title: 'All Projects 📁',
      subtitle: 'Active Commercial Accounts & Contract Margins'
    },
    '/productivity': {
      title: 'Staff Productivity 👥',
      subtitle: 'Billable vs Non-Billable Time Allocation'
    },
    '/categories': {
      title: 'Category Breakdown 📊',
      subtitle: 'Hours & Utilization by Category'
    },
    '/departments': {
      title: 'Department Drill-down 🏢',
      subtitle: 'Department-level Hours & Commercial Costs'
    },
    '/matrix': {
      title: 'Pivot Matrix 🔢',
      subtitle: 'Employee × Category Cross-Tabulation Matrix'
    }
  };

  const currentHeader = pathname.startsWith('/projects/')
    ? {
        title: 'Project Economics & Margin Drilldown 📁',
        subtitle: 'Individual Contract Profitability, Burn Timeline & Employee Contributions'
      }
    : pageHeaders[pathname] || pageHeaders['/'];

  // Helper to format month options nicely
  const monthLabels: Record<string, string> = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFBFF] text-[#111827] flex font-sans">
      {/* 1. Left SaaS Sidebar */}
      <Sidebar />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 sm:p-8 bg-[#FAFBFF]">
        {/* Top Header: Greeting, Year Filter, Month Filter & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
                  {currentHeader.title}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {currentHeader.subtitle}
                </p>
              </div>

              {/* Filters & Actions Bar */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Year Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#5932EA]" />
                  <span className="text-slate-400 font-normal">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-900 font-bold"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#5932EA]" />
                  <span className="text-slate-400 font-normal">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-900 font-bold"
                  >
                    <option value="all">All Months</option>
                    {(selectedYear === 'all'
                      ? availableMonths
                      : availableMonths.filter((m) => m.startsWith(selectedYear))
                    ).map((m) => {
                      const mm = m.split('-')[1] || m;
                      const label = monthLabels[mm] ? `${mm} - ${monthLabels[mm]}` : m;
                      return (
                        <option key={m} value={m}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Audit Status Button */}
                <button
                  onClick={() => setIsAuditOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#008767] bg-[#16C098]/10 hover:bg-[#16C098]/20 border border-[#00B087]/20 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008767]" />
                  <span>0.00 AED Audit</span>
                </button>

                {/* Reset Screen Button */}
                <button
                  onClick={handleResetData}
                  title="Clear data to view welcome hero screen"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* 5 Core Metric Cards: ONLY displayed on Dashboard page (/) */}
            {isDashboard && metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5 flex-shrink-0">
                {/* 1. Total Hours */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3.5 card-float-transition">
                  <div className="w-11 h-11 rounded-full bg-[#EBF2FE] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#ACACAC] font-medium block">Total Hours</span>
                    <h3 className="text-lg font-bold text-[#333333] tracking-tight">
                      <AnimatedMetricNumber value={metrics.totalHours} suffix="h" decimals={1} />
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold block">All Staff Logged</span>
                  </div>
                </div>

                {/* 2. Billable Hours */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3.5 card-float-transition">
                  <div className="w-11 h-11 rounded-full bg-[#E5F9FF] text-[#06B6D4] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#ACACAC] font-medium block">Billable Hours</span>
                    <h3 className="text-lg font-bold text-[#06B6D4] tracking-tight">
                      <AnimatedMetricNumber value={metrics.billableHours} suffix="h" decimals={1} />
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      <AnimatedMetricNumber value={metrics.billableHoursPercent} suffix="% Productivity" decimals={1} />
                    </span>
                  </div>
                </div>

                {/* 3. Cost */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3.5 card-float-transition">
                  <div className="w-11 h-11 rounded-full bg-[#FFF0EB] text-[#FF6A55] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#ACACAC] font-medium block">Total Cost</span>
                    <h3 className="text-lg font-bold text-[#333333] tracking-tight">
                      <AnimatedMetricNumber value={metrics.totalCost} prefix="AED " decimals={0} />
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold block">Direct + Indirect</span>
                  </div>
                </div>

                {/* 4. Revenue */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3.5 card-float-transition">
                  <div className="w-11 h-11 rounded-full bg-[#D3FFE7] text-[#00AC4F] flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#ACACAC] font-medium block">Total Revenue</span>
                    <h3 className="text-lg font-bold text-[#00AC4F] tracking-tight">
                      <AnimatedMetricNumber value={metrics.totalRevenue} prefix="AED " decimals={0} />
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      <AnimatedMetricNumber value={metrics.projectCount} suffix=" Projects" />
                    </span>
                  </div>
                </div>

                {/* 5. Margin */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3.5 card-float-transition">
                  <div className="w-11 h-11 rounded-full bg-[#E7EDFF] text-[#5932EA] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#ACACAC] font-medium block">Gross Margin</span>
                    <h3 className="text-lg font-bold text-[#5932EA] tracking-tight">
                      <AnimatedMetricNumber value={metrics.grossMarginPercent} suffix="%" decimals={1} />
                    </h3>
                    <span className="text-[10px] text-[#5932EA] font-bold block">
                      Profit: <AnimatedMetricNumber value={metrics.totalProfit} prefix="AED " decimals={0} />
                    </span>
                  </div>
                </div>
              </div>
            )}

        {/* 3. Page Content: Renders the active route's scrollable view */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isProcessing ? <ParsingProgress /> : children}
        </div>
      </main>

      {/* Modals */}
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

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </div>
  );
};
