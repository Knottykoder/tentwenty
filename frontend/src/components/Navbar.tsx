'use client';

import React from 'react';
import {
  BarChart3,
  Briefcase,
  Users,
  PieChart,
  Building2,
  Table,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Settings,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
  isReconciled: boolean;
  diffAmount: number;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  isReconciled,
  diffAmount,
  onOpenUpload,
  onOpenSettings,
  onLoadSample,
  isLoadingSample
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects & Profitability', icon: Briefcase },
    { id: 'productivity', label: 'Productivity', icon: Users },
    { id: 'categories', label: 'Category Split', icon: PieChart },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'matrix', label: 'Pivot Matrix', icon: Table },
    { id: 'audit', label: 'Cost Audit', icon: CheckCircle2 }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Self-Check Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-lg">
              10
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
                tentwenty
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  MarginOS
                </span>
              </h1>
              <p className="text-xs text-slate-400">Agency Profit & Cost Engine</p>
            </div>
          </div>

          {/* Self-check badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isReconciled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {isReconciled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Overhead Reconciled: 0.00 AED Diff</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Variance: {diffAmount.toLocaleString()} AED</span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions: Period Filter, Sample Loader, Upload, Settings */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm">
            <span className="text-xs text-slate-400 font-medium">Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                Full Year 2025
              </option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-slate-200">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Load Sample Button */}
          <button
            onClick={onLoadSample}
            disabled={isLoadingSample}
            title="Reload verified 2025 agency sample data"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSample ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Sample Data</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Assumptions & Overhead Settings"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-xs sm:text-sm font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
