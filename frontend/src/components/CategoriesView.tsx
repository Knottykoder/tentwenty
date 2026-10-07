'use client';

import React from 'react';
import { PieChart, Download, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { CategoryItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface CategoriesViewProps {
  categories: CategoryItem[];
  totalHours: number;
  selectedMonth: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, totalHours, selectedMonth }) => {
  const billableHours = categories.filter((c) => c.isBillable).reduce((sum, c) => sum + c.hours, 0);
  const internalHours = categories.filter((c) => !c.isBillable).reduce((sum, c) => sum + c.hours, 0);

  const billableShare = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
  const internalShare = totalHours > 0 ? (internalHours / totalHours) * 100 : 0;

  const handleExportCsv = () => {
    const rows = categories.map((c) => ({
      Category: c.category,
      Classification: c.isBillable ? 'Billable (Client)' : 'Internal Overhead (Agency Absorbed)',
      'Total Hours': c.hours,
      'Share of Agency Time (%)': `${c.sharePercent}%`
    }));
    exportToCsv(`categories_${selectedMonth}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* High-level split summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Time Logged</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{totalHours.toLocaleString()}</h3>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Across all 12 staff in {selectedMonth === 'all' ? '2025' : selectedMonth}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Client Billable Work</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {billableHours.toLocaleString()}
            </h3>
            <span className="text-xs text-emerald-300/80">hours ({billableShare.toFixed(1)}%)</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Projects, Enhancements, Hosting
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Internal Non-Billable</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {internalHours.toLocaleString()}
            </h3>
            <span className="text-xs text-amber-300/80">hours ({internalShare.toFixed(1)}%)</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Absorbed into indirect cost pool
          </p>
        </div>
      </div>

      {/* Categories Breakdown Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Category Time Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies where company hours go (Meetings, Bug Fixes, Leaves, Learning, Client Work).
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Hours Logged</th>
                <th className="py-3 px-4 text-right">Share of Time</th>
                <th className="py-3 px-4 min-w-[180px]">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {categories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{c.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.isBillable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {c.isBillable ? 'Billable (Project)' : 'Internal (Absorbed)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-white">
                    {c.hours.toLocaleString()}h
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                    {c.sharePercent}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.isBillable ? 'bg-emerald-400' : 'bg-slate-500'}`}
                          style={{ width: `${Math.min(100, c.sharePercent)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
