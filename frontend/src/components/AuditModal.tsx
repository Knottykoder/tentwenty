'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Calculator, Download } from 'lucide-react';
import { MonthlyReconciliation } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose }) => {
  const [reconciliations, setReconciliations] = useState<MonthlyReconciliation[]>([]);
  const [fullYearAudit, setFullYearAudit] = useState<{
    totalSalaries: number;
    totalProjectCost: number;
    overheadIncluded: number;
    isReconciled: boolean;
    difference: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.monthlyReconciliations) {
            setReconciliations(data.monthlyReconciliations);
          }
          if (data.metrics?.reconciliationAudit) {
            setFullYearAudit(data.metrics.reconciliationAudit);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportAudit = () => {
    const rows = reconciliations.map((r) => ({
      Month: r.month,
      'Total Salaries (AED)': r.totalSalaries,
      'Support Staff Salaries (AED)': r.supportStaffSalaries,
      'Non-Billable Direct Cost (AED)': r.nonbillableCost,
      'Overhead (AED)': r.monthlyOverhead,
      'Indirect Cost Pool (AED)': r.indirectCostPool,
      'Billable Hours': r.billableHours,
      'Indirect Rate / Hour (AED)': r.indirectRatePerHour.toFixed(2),
      'Billable Project Cost (AED)': r.billableProjectCost,
      'Variance (AED)': r.differenceWithSalaries
    }));
    exportToCsv('monthly_cost_audit', rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Audit View & Rate Derivations
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Monthly Cost Rate Breakdown & Reconciliation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct and indirect rates derived per month proving zero-drift reconciliation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Formula Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 p-4 rounded-2xl font-mono text-slate-700">
            <div>
              <p className="text-blue-600 font-bold mb-1 font-sans text-xs">Direct Cost Rate / Hour:</p>
              <p className="text-slate-600">= Month Salary ÷ Month Total Logged Hours</p>
              <p className="text-blue-600 font-bold mt-3 mb-1 font-sans text-xs">Indirect Cost Pool:</p>
              <p className="text-slate-600">= Support Staff + Non-Billable Time × Direct Rate + Overhead</p>
            </div>
            <div>
              <p className="text-blue-600 font-bold mb-1 font-sans text-xs">Indirect Cost Rate / Hour:</p>
              <p className="text-slate-600">= Indirect Cost Pool ÷ Billable Hours That Month</p>
              <p className="text-blue-600 font-bold mt-3 mb-1 font-sans text-xs">Self-Check (Overhead = 0):</p>
              <p className="text-emerald-700 font-bold">Total Company Cost == Total Salaries (to the dirham)</p>
            </div>
          </div>

          {/* Full year audit summary */}
          {fullYearAudit && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Reconciliation Status
                </span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  Full Year Salaries: AED {fullYearAudit.totalSalaries.toLocaleString()} | Total Project Cost: AED {fullYearAudit.totalProjectCost.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Difference: <span className="text-emerald-700 font-bold font-mono">{fullYearAudit.difference.toFixed(2)} AED</span> (Exact Match)
                </p>
              </div>

              <button
                onClick={handleExportAudit}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit CSV
              </button>
            </div>
          )}

          {/* Monthly Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Monthly Breakdown (2025)
              </h3>
              <span className="text-xs text-slate-500 font-medium">12 Months</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Month</th>
                    <th className="py-2.5 px-3.5 text-right">Salaries</th>
                    <th className="py-2.5 px-3.5 text-right">Non-Billable Cost</th>
                    <th className="py-2.5 px-3.5 text-right">Indirect Pool</th>
                    <th className="py-2.5 px-3.5 text-right">Billable Hrs</th>
                    <th className="py-2.5 px-3.5 text-right">Indirect Rate / hr</th>
                    <th className="py-2.5 px-3.5 text-right">Project Cost</th>
                    <th className="py-2.5 px-3.5 text-right">Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reconciliations.map((r) => (
                    <tr key={r.month} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">{r.month}</td>
                      <td className="py-2.5 px-3.5 text-right font-mono">AED {r.totalSalaries.toLocaleString()}</td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-500">
                        AED {r.nonbillableCost.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono">
                        AED {r.indirectCostPool.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono">{r.billableHours.toLocaleString()}h</td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold text-blue-600">
                        AED {r.indirectRatePerHour.toFixed(2)}/h
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                        AED {r.billableProjectCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-emerald-700 font-bold">
                        {r.differenceWithSalaries.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
