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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {project.refCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  project.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {project.status}
              </span>
              <span className="text-xs text-slate-500 font-medium">Sales Month: {project.salesMonth}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
              {project.projectName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-5 space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Project Price
              </span>
              <p className="text-lg font-bold text-slate-900 mt-1">AED {project.price.toLocaleString()}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Total Hours
              </span>
              <p className="text-lg font-bold text-slate-900 mt-1">{project.totalHours.toLocaleString()} hrs</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Total Cost
              </span>
              <p className="text-lg font-bold text-slate-900 mt-1">AED {project.totalCost.toLocaleString()}</p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                isProfitable
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-red-200 bg-red-50/60'
              }`}
            >
              <span className="text-xs font-semibold flex items-center justify-between text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Profit & Margin
                </span>
                <span
                  className={`font-bold ${
                    isProfitable ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {project.margin}%
                </span>
              </span>
              <p
                className={`text-lg font-bold mt-1 ${
                  isProfitable ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                AED {project.profit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Hours by Department
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(project.departmentHours).map(([dept, hours]) => {
                const pct = project.totalHours > 0 ? (hours / project.totalHours) * 100 : 0;
                return (
                  <div key={dept} className="rounded-xl bg-white border border-slate-200 p-3 text-center">
                    <span className="text-xs font-semibold text-slate-500 block truncate">{dept}</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">{hours.toFixed(1)}h</span>
                    <span className="text-[11px] font-bold text-blue-600 block mt-0.5">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-Employee Contribution Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Per-Employee Contribution & Profitability
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Revenue Share = Price × (Hours ÷ Total Hours) | Profit = Revenue Share − Cost
                </p>
              </div>
              <button
                onClick={handleExportContributions}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Employee</th>
                    <th className="py-2.5 px-3.5">Dept</th>
                    <th className="py-2.5 px-3.5 text-right">Hours</th>
                    <th className="py-2.5 px-3.5 text-right">Total Cost</th>
                    <th className="py-2.5 px-3.5 text-right">Revenue Share</th>
                    <th className="py-2.5 px-3.5 text-right">Employee Profit</th>
                    <th className="py-2.5 px-3.5 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {project.employeeContributions.map((emp) => {
                    const empProfitable = emp.profit >= 0;
                    return (
                      <tr key={emp.employeeName} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900">{emp.employeeName}</td>
                        <td className="py-2.5 px-3.5 text-slate-500">{emp.department}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-medium">{emp.hours}h</td>
                        <td className="py-2.5 px-3.5 text-right font-mono">AED {emp.cost.toLocaleString()}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono">AED {emp.revenueShare.toLocaleString()}</td>
                        <td
                          className={`py-2.5 px-3.5 text-right font-mono font-bold ${
                            empProfitable ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          AED {emp.profit.toLocaleString()}
                        </td>
                        <td
                          className={`py-2.5 px-3.5 text-right font-mono font-bold ${
                            empProfitable ? 'text-emerald-700' : 'text-red-700'
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
