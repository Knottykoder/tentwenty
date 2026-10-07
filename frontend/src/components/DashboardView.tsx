'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { DashboardMetrics, MonthlyTrend } from '../types/dashboard';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  trends: MonthlyTrend[];
  selectedMonth: string;
  onOpenAudit: () => void;
  onSelectProjectTab: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  trends,
  selectedMonth,
  onOpenAudit,
  onSelectProjectTab
}) => {
  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
        <p>No dashboard data available for this selection.</p>
      </div>
    );
  }

  const isProfitable = metrics.totalProfit >= 0;
  const isReconciled = metrics.reconciliationAudit.isReconciled;

  return (
    <div className="space-y-6">
      {/* Reconciliation Banner */}
      <div
        className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isReconciled
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isReconciled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {isReconciled
                ? 'Zero-Overhead Reconciliation Passed: 0.00 AED Variance'
                : `Variance Detected: ${metrics.reconciliationAudit.difference.toLocaleString()} AED`}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Salaries across all staff ({metrics.reconciliationAudit.totalSalaries.toLocaleString()} AED)
              reconcile to the dirham against Total Billable Project Costs ({metrics.reconciliationAudit.totalProjectCost.toLocaleString()} AED).
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAudit}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
        >
          View Cost Rate Audit
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Hours */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Agency Hours</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.totalHours.toLocaleString()}
            </h3>
            <span className="text-xs font-medium text-slate-400">hours</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Billable Hours</span>
            <span className="font-semibold text-emerald-400">
              {metrics.billableHours.toLocaleString()} hrs ({metrics.billableHoursPercent}%)
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              AED {metrics.totalRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Total Projects</span>
            <span className="font-semibold text-slate-200">{metrics.projectCount} projects</span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Cost (Direct + Indirect)</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              AED {metrics.totalCost.toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Staff Count</span>
            <span className="font-semibold text-slate-200">{metrics.employeeCount} active</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Profit</span>
            <div
              className={`p-2 rounded-lg ${
                isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3
              className={`text-2xl sm:text-3xl font-extrabold ${
                isProfitable ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              AED {metrics.totalProfit.toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Period</span>
            <span className="font-semibold text-slate-300">
              {selectedMonth === 'all' ? 'Full Year 2025' : selectedMonth}
            </span>
          </div>
        </div>

        {/* Margin */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gross Margin</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.grossMarginPercent}%
            </h3>
            <span className="text-xs font-medium text-emerald-400">healthy</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Formula</span>
            <span className="font-mono text-[11px] text-slate-400">(Rev − Cost) ÷ Rev</span>
          </div>
        </div>

        {/* Productivity Ratio */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Billable Productivity</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.billableHoursPercent}%
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Non-billable absorbed</span>
            <span className="font-medium text-slate-300">
              {(100 - metrics.billableHoursPercent).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Trend Overview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">2025 Monthly Trajectory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly breakdown of billable vs total hours, costs and gross margins across the agency.
            </p>
          </div>
          <button
            onClick={onSelectProjectTab}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <Briefcase className="w-3.5 h-3.5" />
            View Projects Table →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3 text-right">Total Hours</th>
                <th className="py-2.5 px-3 text-right">Billable Hours</th>
                <th className="py-2.5 px-3 text-right">Productivity</th>
                <th className="py-2.5 px-3 text-right">Cost (AED)</th>
                <th className="py-2.5 px-3 text-right">Revenue (AED)</th>
                <th className="py-2.5 px-3 text-right">Profit (AED)</th>
                <th className="py-2.5 px-3 text-right">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {trends.map((t) => {
                const isSelected = selectedMonth === t.month;
                const mProd = t.totalHours > 0 ? ((t.billableHours / t.totalHours) * 100).toFixed(1) : '0';
                return (
                  <tr
                    key={t.month}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-emerald-500/10 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-white">{t.month}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{t.totalHours.toLocaleString()}h</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {t.billableHours.toLocaleString()}h
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{mProd}%</td>
                    <td className="py-2.5 px-3 text-right font-mono">AED {t.cost.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono">AED {t.revenue.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      AED {t.profit.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                      {t.margin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
