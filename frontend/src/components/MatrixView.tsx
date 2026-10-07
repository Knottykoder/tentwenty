'use client';

import React, { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

interface MatrixData {
  categories: string[];
  employees: {
    employeeNo: string;
    employeeName: string;
    department: string;
    hoursByCat: Record<string, number>;
    total: number;
  }[];
  columnTotals: Record<string, number>;
  grandTotal: number;
}

interface MatrixViewProps {
  selectedMonth: string;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ selectedMonth }) => {
  const [data, setData] = useState<MatrixData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/matrix?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-3xl p-6 border border-slate-100">
        <p className="text-xs font-semibold text-slate-400">Loading pivot matrix...</p>
      </div>
    );
  }

  if (!data || !data.employees.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-3xl p-6 border border-slate-100">
        <p className="text-xs font-semibold text-slate-400">No records found for this period.</p>
      </div>
    );
  }

  const filteredEmployees = data.employees.filter(
    (e) =>
      e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCsv = () => {
    const rows = filteredEmployees.map((e) => {
      const row: Record<string, unknown> = {
        'Employee No': e.employeeNo,
        'Employee Name': e.employeeName,
        Department: e.department
      };
      for (const cat of data.categories) {
        row[cat] = e.hoursByCat[cat] || 0;
      }
      row['Total Hours'] = e.total;
      return row;
    });
    exportToCsv(`employee_category_pivot_${selectedMonth}`, rows);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
            Employee × Category Pivot Matrix
          </h2>
          <p className="text-xs font-semibold text-[#16C098] mt-0.5">
            Automated matrix replacing the manual finance spreadsheet. Hours logged across all categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-900 outline-none placeholder:text-slate-400 font-medium w-36"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Pivot CSV
          </button>
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 border-t border-b border-slate-100">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-20 text-[#B5B7C0] font-semibold text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3.5 sticky left-0 bg-white z-30">Employee</th>
              <th className="py-2.5 px-3.5">Dept</th>
              {data.categories.map((cat) => (
                <th key={cat} className="py-2.5 px-3.5 text-right">
                  {cat}
                </th>
              ))}
              <th className="py-2.5 px-3.5 text-right bg-slate-50 text-[#5932EA] font-extrabold">Total Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#292D32]">
            {filteredEmployees.map((emp) => (
              <tr key={emp.employeeName} className="hover:bg-[#F9FBFF] transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-[#111827] sticky left-0 bg-white z-10 border-r border-slate-100">
                  {emp.employeeName}
                </td>
                <td className="py-2.5 px-3.5 text-slate-500 font-medium">{emp.department}</td>
                {data.categories.map((cat) => {
                  const hrs = emp.hoursByCat[cat] || 0;
                  return (
                    <td
                      key={cat}
                      className={`py-2.5 px-3.5 text-right font-mono font-medium ${
                        hrs > 0 ? 'text-slate-800' : 'text-slate-300'
                      }`}
                    >
                      {hrs > 0 ? `${hrs}h` : '-'}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#5932EA] bg-[#F9FBFF]">
                  {emp.total}h
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-[#F9FBFF] font-bold border-t-2 border-slate-200 text-[#111827] z-20">
            <tr>
              <td className="py-3 px-3.5 sticky left-0 bg-[#F9FBFF] z-30">Total Hours</td>
              <td className="py-3 px-3.5">-</td>
              {data.categories.map((cat) => (
                <td key={cat} className="py-3 px-3.5 text-right font-mono">
                  {(data.columnTotals[cat] || 0).toLocaleString()}h
                </td>
              ))}
              <td className="py-3 px-3.5 text-right font-mono text-[#5932EA] text-sm font-extrabold">
                {data.grandTotal.toLocaleString()}h
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
        <span>Showing {filteredEmployees.length} of {data.employees.length} employees</span>
      </div>
    </div>
  );
};
