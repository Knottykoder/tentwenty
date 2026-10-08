'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Calendar, SlidersHorizontal, ShieldCheck, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatMonthLabel } from '../utils/formatters';

const PAGE_HEADERS: Record<string, { title: string; subtitle: string }> = {
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

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
    availableMonths,
    setIsAuditOpen,
    handleResetData
  } = useData();

  const currentHeader = pathname.startsWith('/projects/')
    ? {
        title: 'Project Economics & Margin Drilldown 📁',
        subtitle: 'Individual Contract Profitability, Burn Timeline & Employee Contributions'
      }
    : PAGE_HEADERS[pathname] || PAGE_HEADERS['/'];

  return (
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
            ).map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
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
  );
};
