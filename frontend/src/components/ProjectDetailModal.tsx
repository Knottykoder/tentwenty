'use client';

import React from 'react';
import { X, Briefcase, Download, Clock, DollarSign, TrendingUp, Layers } from 'lucide-react';
import { ProjectMetric } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface ProjectDetailModalProps {
  project: ProjectMetric | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const handleExportContributions = () => {
    const rows = project.employeeContributions.map((c) => ({
      'Employee No': c.employeeNo,
      'Employee Name': c.employeeName,
      Department: c.department,
      'Hours Logged': c.hours,
      'Cost (AED)': c.cost,
      'Revenue Share (AED)': c.revenueShare,
      'Profit (AED)': c.profit,
      'Profitability Margin (%)': `${c.profitabilityMargin}%`
    }));
    exportToCsv(`${project.refCode}_contributions`, rows);
  };

  const isProfitable = project.profit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {project.refCode}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  project.status === 'completed'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {project.status}
              </span>
              <span className="text-xs text-slate-400">Sales: {project.salesMonth}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              {project.projectName}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-5 space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Project Price
              </span>
              <p className="text-lg font-bold text-white mt-1">AED {project.price.toLocaleString()}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Total Hours
              </span>
              <p className="text-lg font-bold text-white mt-1">{project.totalHours.toLocaleString()} hrs</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Total Cost (Direct+Indirect)
              </span>
              <p className="text-lg font-bold text-slate-200 mt-1">AED {project.totalCost.toLocaleString()}</p>
            </div>

            <div
              className={`rounded-xl border p-3.5 ${
                isProfitable
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Profit & Margin
                </span>
                <span
                  className={`font-semibold text-xs ${
                    isProfitable ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {project.margin}%
                </span>
              </span>
              <p
                className={`text-lg font-bold mt-1 ${
                  isProfitable ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                AED {project.profit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Hours by Department
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(project.departmentHours).map(([dept, hours]) => {
                const pct = project.totalHours > 0 ? (hours / project.totalHours) * 100 : 0;
                return (
                  <div key={dept} className="rounded-lg bg-slate-900 border border-slate-800/80 p-2.5 text-center">
                    <span className="text-xs font-medium text-slate-400 block truncate">{dept}</span>
                    <span className="text-sm font-bold text-white block mt-0.5">{hours.toFixed(1)}h</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-Employee Contribution Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Per-Employee Contribution & Profitability
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Revenue Share = Price × (Hours ÷ Total Hours) | Profit = Revenue Share − Cost
                </p>
              </div>
              <button
                onClick={handleExportContributions}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Dept</th>
                    <th className="py-2.5 px-3 text-right">Hours</th>
                    <th className="py-2.5 px-3 text-right">Total Cost</th>
                    <th className="py-2.5 px-3 text-right">Revenue Share</th>
                    <th className="py-2.5 px-3 text-right">Employee Profit</th>
                    <th className="py-2.5 px-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {project.employeeContributions.map((emp) => {
                    const empProfitable = emp.profit >= 0;
                    return (
                      <tr key={emp.employeeName} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-medium text-white">{emp.employeeName}</td>
                        <td className="py-2.5 px-3 text-slate-400">{emp.department}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{emp.hours}h</td>
                        <td className="py-2.5 px-3 text-right font-mono">AED {emp.cost.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono">AED {emp.revenueShare.toLocaleString()}</td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-medium ${
                            empProfitable ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          AED {emp.profit.toLocaleString()}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-semibold ${
                            empProfitable ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {emp.profitabilityMargin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
