'use client';

import React, { useState } from 'react';
import { Users, Download, ArrowUpDown } from 'lucide-react';
import { ProductivityItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface ProductivityViewProps {
  items: ProductivityItem[];
  selectedMonth: string;
}

export const ProductivityView: React.FC<ProductivityViewProps> = ({ items, selectedMonth }) => {
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const departments = Array.from(new Set(items.map((i) => i.department)));

  const filtered = items.filter((i) => {
    return departmentFilter === 'all' || i.department.toLowerCase() === departmentFilter.toLowerCase();
  });

  const handleExportCsv = () => {
    const rows = filtered.map((i) => ({
      'Employee No': i.employeeNo,
      'Employee Name': i.employeeName,
      Department: i.department,
      Designation: i.designation,
      'Total Hours': i.totalHours,
      'Billable Hours': i.billableHours,
      'Non-Billable Hours': i.nonBillableHours,
      'Productivity Rate (%)': `${i.productivityRate}%`
    }));
    exportToCsv(`productivity_${selectedMonth}`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Employee Productivity Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: Billable Hours ÷ Total Hours Logged per employee ({selectedMonth === 'all' ? 'Full Year' : selectedMonth})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Productivity Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Emp ID</th>
                <th className="py-3 px-3.5">Employee Name</th>
                <th className="py-3 px-3.5">Department</th>
                <th className="py-3 px-3.5">Designation</th>
                <th className="py-3 px-3.5 text-right">Total Hours</th>
                <th className="py-3 px-3.5 text-right">Billable</th>
                <th className="py-3 px-3.5 text-right">Non-Billable</th>
                <th className="py-3 px-3.5 min-w-[160px]">Productivity Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((item) => {
                const isHigh = item.productivityRate >= 75;
                const isMid = item.productivityRate >= 50 && item.productivityRate < 75;
                return (
                  <tr key={item.employeeName} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400">{item.employeeNo}</td>
                    <td className="py-3 px-3.5 font-medium text-white">{item.employeeName}</td>
                    <td className="py-3 px-3.5 text-slate-400">{item.department}</td>
                    <td className="py-3 px-3.5 text-slate-400 max-w-xs truncate">{item.designation}</td>
                    <td className="py-3 px-3.5 text-right font-mono">{item.totalHours}h</td>
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-400">{item.billableHours}h</td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-400">{item.nonBillableHours}h</td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-emerald-400' : isMid ? 'bg-cyan-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, item.productivityRate)}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-xs font-semibold w-12 text-right ${
                            isHigh ? 'text-emerald-400' : isMid ? 'text-cyan-400' : 'text-amber-400'
                          }`}
                        >
                          {item.productivityRate}%
                        </span>
                      </div>
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
