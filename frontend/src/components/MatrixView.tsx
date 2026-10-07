'use client';

import React, { useState, useEffect } from 'react';
import { Table, Download, Search } from 'lucide-react';
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
    return <div className="p-8 text-center text-xs text-slate-400">Loading pivot matrix...</div>;
  }

  if (!data || !data.employees.length) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No timesheet records found for this period.
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
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" />
            Employee × Category Pivot Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated pivot replacing the manual finance matrix. Displays hours per person across all categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 outline-none placeholder:text-slate-500 w-36"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export Pivot CSV
          </button>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-slate-950/95 z-10">Employee</th>
                <th className="py-2.5 px-3">Dept</th>
                {data.categories.map((cat) => (
                  <th key={cat} className="py-2.5 px-3 text-right">
                    {cat}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right bg-slate-950/90 text-emerald-400">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeName} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-medium text-white sticky left-0 bg-slate-900/95 z-10 border-r border-slate-800/50">
                    {emp.employeeName}
                  </td>
                  <td className="py-2 px-3 text-slate-400">{emp.department}</td>
                  {data.categories.map((cat) => {
                    const hrs = emp.hoursByCat[cat] || 0;
                    return (
                      <td
                        key={cat}
                        className={`py-2 px-3 text-right font-mono ${
                          hrs > 0 ? 'text-slate-200' : 'text-slate-600'
                        }`}
                      >
                        {hrs > 0 ? `${hrs}h` : '-'}
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400 bg-slate-950/40">
                    {emp.total}h
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950/90 font-semibold border-t-2 border-slate-800 text-slate-200">
              <tr>
                <td className="py-2.5 px-3 sticky left-0 bg-slate-950/95 z-10">Total Hours</td>
                <td className="py-2.5 px-3">-</td>
                {data.categories.map((cat) => (
                  <td key={cat} className="py-2.5 px-3 text-right font-mono text-white">
                    {(data.columnTotals[cat] || 0).toLocaleString()}h
                  </td>
                ))}
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400 text-sm">
                  {data.grandTotal.toLocaleString()}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
