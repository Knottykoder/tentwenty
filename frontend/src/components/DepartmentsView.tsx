'use client';

import React, { useState } from 'react';
import { Building2, Users, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { DepartmentItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface DepartmentsViewProps {
  departments: DepartmentItem[];
  selectedMonth: string;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ departments, selectedMonth }) => {
  const [expandedDept, setExpandedDept] = useState<string | null>(
    departments.length > 0 ? departments[0].department : null
  );

  const toggleDept = (deptName: string) => {
    setExpandedDept(expandedDept === deptName ? null : deptName);
  };

  const handleExportCsv = (dept: DepartmentItem) => {
    const rows = dept.employees.map((e) => ({
      Department: dept.department,
      'Employee No': e.employeeNo,
      'Employee Name': e.employeeName,
      Designation: e.designation,
      'Total Hours': e.hours,
      'Billable Hours': e.billableHours,
      'Total Cost (AED)': e.cost
    }));
    exportToCsv(`${dept.department}_department_breakdown`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Department Drill-Down
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any department (e.g. Design, Frontend, Backend) to inspect individual hours and total costs.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">{departments.length} Departments</span>
      </div>

      {/* Accordion / Drilldown Cards */}
      <div className="space-y-3">
        {departments.map((dept) => {
          const isExpanded = expandedDept === dept.department;
          return (
            <div
              key={dept.department}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm transition-all"
            >
              {/* Department Summary Header */}
              <div
                onClick={() => toggleDept(dept.department)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-800/40 gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {dept.department}
                      <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {dept.employeeCount} staff
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 text-xs pl-9 sm:pl-0">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Hours</span>
                    <span className="font-mono font-semibold text-white text-sm">
                      {dept.totalHours.toLocaleString()}h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Billable Hours</span>
                    <span className="font-mono font-semibold text-emerald-400 text-sm">
                      {dept.billableHours.toLocaleString()}h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Department Cost</span>
                    <span className="font-mono font-semibold text-white text-sm">
                      AED {dept.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drilldown Employee Details */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Individual Breakdown: {dept.department}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCsv(dept);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Emp ID</th>
                          <th className="py-2 px-3">Employee Name</th>
                          <th className="py-2 px-3">Designation</th>
                          <th className="py-2 px-3 text-right">Total Hours</th>
                          <th className="py-2 px-3 text-right">Billable Hours</th>
                          <th className="py-2 px-3 text-right">Cost (Direct + Indirect)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {dept.employees.map((emp) => (
                          <tr key={emp.employeeName} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{emp.employeeNo}</td>
                            <td className="py-2.5 px-3 font-medium text-white">{emp.employeeName}</td>
                            <td className="py-2.5 px-3 text-slate-400">{emp.designation}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{emp.hours}h</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                              {emp.billableHours}h
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                              AED {emp.cost.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
