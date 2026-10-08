'use client';

import React, { useState } from 'react';
import { Users, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { DepartmentItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';
import { DepartmentDonutChart } from './DepartmentDonutChart';

interface DepartmentsViewProps {
  departments: DepartmentItem[];
  selectedMonth: string;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ departments, selectedMonth }) => {
  const [expandedDept, setExpandedDept] = useState<string | null>(
    departments.length > 0 ? departments[0].department : null
  );
  const [metricMode, setMetricMode] = useState<'cost' | 'hours'>('cost');

  const toggleDept = (deptName: string) => {
    setExpandedDept(expandedDept === deptName ? null : deptName);
  };

  const handleSelectFromChart = (deptName: string) => {
    setExpandedDept(deptName);
    // Smooth scroll to the department card in accordion list
    setTimeout(() => {
      const el = document.getElementById(`dept-card-${deptName}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
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
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
            Department Cost & Hours Drill-Down
          </h2>
          <p className="text-xs font-semibold text-[#16C098] mt-0.5">
            Click any chart slice or row to inspect individual headcount, hours, and fully-loaded costs
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
          {departments.length} Departments Total
        </span>
      </div>

      {/* Interactive Donut / Pie Chart Section */}
      {departments.length > 0 && (
        <DepartmentDonutChart
          departments={departments}
          activeDept={expandedDept}
          onSelectDept={handleSelectFromChart}
          metricMode={metricMode}
          setMetricMode={setMetricMode}
        />
      )}

      {/* Scrollable Container for Accordions */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 border-t border-b border-slate-100 py-3">
        {departments.map((dept) => {
          const isExpanded = expandedDept === dept.department;
          return (
            <div
              key={dept.department}
              id={`dept-card-${dept.department}`}
              className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                isExpanded
                  ? 'border-[#5932EA] shadow-md ring-1 ring-[#5932EA]/20'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => toggleDept(dept.department)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-[#F9FBFF] gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#5932EA]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                      {dept.department}
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {dept.employeeCount} staff
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs pl-9 sm:pl-0">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Total Hours</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {dept.totalHours.toLocaleString()}h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Billable Hours</span>
                    <span className="font-mono font-bold text-[#5932EA] text-sm">
                      {dept.billableHours.toLocaleString()}h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Total Department Cost</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      AED {dept.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-[#F9FBFF] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#5932EA]" />
                      Individual Breakdown: {dept.department}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCsv(dept);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <thead className="bg-[#f8fafc] text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Emp ID</th>
                          <th className="py-2.5 px-3.5">Employee Name</th>
                          <th className="py-2.5 px-3.5">Designation</th>
                          <th className="py-2.5 px-3.5 text-right">Total Hours</th>
                          <th className="py-2.5 px-3.5 text-right">Billable Hours</th>
                          <th className="py-2.5 px-3.5 text-right">Cost (Direct + Indirect)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {dept.employees.map((emp) => (
                          <tr key={emp.employeeName} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3.5 font-mono text-slate-400">{emp.employeeNo}</td>
                            <td className="py-2.5 px-3.5 font-bold text-slate-900">{emp.employeeName}</td>
                            <td className="py-2.5 px-3.5 text-slate-500">{emp.designation}</td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-medium">{emp.hours}h</td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#5932EA]">
                              {emp.billableHours}h
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
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

      <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
        <span>Showing {departments.length} departments</span>
      </div>
    </div>
  );
};
