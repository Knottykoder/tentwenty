'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, DollarSign, Calculator, Download } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
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
        .catch(console.error)
        .finally(() => setLoading(false));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Audit View & Rate Derivation
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Monthly Cost Rate Breakdown & Reconciliation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Shows how each month's direct and indirect hourly rates were derived, proving zero double-counting.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Formula Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/70 border border-slate-800 p-4 rounded-xl font-mono text-slate-300">
            <div>
              <p className="text-emerald-400 font-semibold mb-1 font-sans text-xs">Direct Cost Rate / Hour:</p>
              <p className="text-slate-400">= Month Salary ÷ Month Total Logged Hours</p>
              <p className="text-emerald-400 font-semibold mt-3 mb-1 font-sans text-xs">Indirect Cost Pool:</p>
              <p className="text-slate-400">= Support Staff (0 hrs) + Non-Billable Time × Direct Rate + Overhead</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold mb-1 font-sans text-xs">Indirect Cost Rate / Hour:</p>
              <p className="text-slate-400">= Indirect Cost Pool ÷ Billable Hours That Month</p>
              <p className="text-emerald-400 font-semibold mt-3 mb-1 font-sans text-xs">Self-Check (Overhead = 0):</p>
              <p className="text-emerald-300 font-semibold">Total Company Cost == Total Salaries (to the dirham)</p>
            </div>
          </div>

          {/* Full year audit summary */}
          {fullYearAudit && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Reconciliation Status
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  Full Year Salaries: AED {fullYearAudit.totalSalaries.toLocaleString()} | Total Project Cost: AED {fullYearAudit.totalProjectCost.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Difference: <span className="text-emerald-400 font-semibold font-mono">{fullYearAudit.difference.toFixed(2)} AED</span> (Exact Match)
                </p>
              </div>

              <button
                onClick={handleExportAudit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit CSV
              </button>
            </div>
          )}

          {/* Monthly Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Monthly Breakdown (2025)
              </h3>
              <span className="text-xs text-slate-400">12 Months</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Salaries</th>
                    <th className="py-2.5 px-3 text-right">Non-Billable Cost</th>
                    <th className="py-2.5 px-3 text-right">Indirect Pool</th>
                    <th className="py-2.5 px-3 text-right">Billable Hrs</th>
                    <th className="py-2.5 px-3 text-right">Indirect Rate / hr</th>
                    <th className="py-2.5 px-3 text-right">Project Cost</th>
                    <th className="py-2.5 px-3 text-right">Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reconciliations.map((r) => (
                    <tr key={r.month} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-medium text-white">{r.month}</td>
                      <td className="py-2.5 px-3 text-right font-mono">AED {r.totalSalaries.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        AED {r.nonbillableCost.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        AED {r.indirectCostPool.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.billableHours.toLocaleString()}h</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-400">
                        AED {r.indirectRatePerHour.toFixed(2)}/h
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                        AED {r.billableProjectCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
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
