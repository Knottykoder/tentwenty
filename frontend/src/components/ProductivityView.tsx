'use client';

import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { ProductivityItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface ProductivityViewProps {
  items: ProductivityItem[];
  selectedMonth: string;
}

export const ProductivityView: React.FC<ProductivityViewProps> = ({ items, selectedMonth }) => {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = Array.from(new Set(items.map((i) => i.department)));

  const filtered = items.filter((i) => {
    const matchesDept =
      departmentFilter === 'all' || i.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch =
      i.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.employeeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.designation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
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
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
            Employee Productivity Analysis
          </h2>
          <p className="text-xs font-semibold text-[#16C098] mt-0.5">
            Billable Hours ÷ Total Hours Logged per employee
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-800 outline-none placeholder:text-slate-400 font-medium w-36"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 border-t border-b border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white z-10 text-[#B5B7C0] font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Emp ID</th>
              <th className="py-3 px-4">Employee Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4 text-right">Total Hours</th>
              <th className="py-3 px-4 text-right">Billable Hours</th>
              <th className="py-3 px-4 text-right">Non-Billable</th>
              <th className="py-3 px-4 min-w-[200px]">Productivity Progress</th>
              <th className="py-3 px-4 text-center">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#292D32]">
            {filtered.map((item) => {
              const isHigh = item.productivityRate >= 75;
              const isMid = item.productivityRate >= 50 && item.productivityRate < 75;

              return (
                <tr key={item.employeeName} className="hover:bg-[#F9FBFF] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">{item.employeeNo}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{item.employeeName}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{item.department}</td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{item.designation}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">{item.totalHours}h</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#5932EA]">{item.billableHours}h</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">{item.nonBillableHours}h</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isHigh ? 'bg-[#16C098]' : isMid ? 'bg-[#5932EA]' : 'bg-[#FFC5C5]'
                          }`}
                          style={{ width: `${Math.min(100, item.productivityRate)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold w-12 text-right text-[#111827]">
                        {item.productivityRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold border ${
                        isHigh
                          ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isHigh ? 'Optimal' : 'Absorbed'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
        <span>Showing {filtered.length} of {items.length} employees</span>
        <div className="flex items-center gap-1.5">
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold">&lt;</button>
          <button className="w-6 h-6 rounded-md bg-[#5932EA] text-white flex items-center justify-center text-xs font-bold">1</button>
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold">&gt;</button>
        </div>
      </div>
    </div>
  );
};
