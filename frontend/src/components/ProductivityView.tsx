'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { ProductivityItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';
import { DataTable } from './common/DataTable';
import { SearchInput } from './common/SearchInput';

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
    <DataTable<ProductivityItem>
      title="Employee Productivity Analysis"
      subtitle="Billable Hours ÷ Total Hours Logged per employee"
      actions={
        <>
          <SearchInput
            placeholder="Search employee..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <div className="flex items-center gap-1.5 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </>
      }
      data={filtered}
      getRowKey={(item) => item.employeeNo}
      columns={[
        {
          header: 'Emp ID',
          className: 'font-mono text-slate-400 font-semibold',
          accessorKey: 'employeeNo'
        },
        {
          header: 'Employee Name',
          className: 'font-bold text-[#111827]',
          accessorKey: 'employeeName'
        },
        {
          header: 'Department',
          className: 'text-slate-500 font-medium',
          accessorKey: 'department'
        },
        {
          header: 'Designation',
          className: 'text-slate-500 max-w-xs truncate',
          accessorKey: 'designation'
        },
        {
          header: 'Total Hours',
          align: 'right',
          className: 'font-mono font-bold text-[#111827]',
          cell: (item) => `${item.totalHours}h`
        },
        {
          header: 'Billable Hours',
          align: 'right',
          className: 'font-mono font-bold text-[#5932EA]',
          cell: (item) => `${item.billableHours}h`
        },
        {
          header: 'Non-Billable',
          align: 'right',
          className: 'font-mono text-slate-400',
          cell: (item) => `${item.nonBillableHours}h`
        },
        {
          header: 'Productivity Progress',
          headerClassName: 'min-w-[200px]',
          cell: (item) => {
            const isHigh = item.productivityRate >= 75;
            const isMid = item.productivityRate >= 50 && item.productivityRate < 75;
            return (
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
            );
          }
        },
        {
          header: 'Efficiency',
          align: 'center',
          cell: (item) => {
            const isHigh = item.productivityRate >= 75;
            return (
              <span
                className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold border ${
                  isHigh
                    ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {isHigh ? 'Optimal' : 'Absorbed'}
              </span>
            );
          }
        }
      ]}
      showFooter
      footerText={`Showing ${filtered.length} of ${items.length} employees`}
    />
  );
};
