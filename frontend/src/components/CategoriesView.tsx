'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { CategoryItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface CategoriesViewProps {
  categories: CategoryItem[];
  totalHours: number;
  selectedMonth: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, totalHours, selectedMonth }) => {
  const handleExportCsv = () => {
    const rows = categories.map((c) => ({
      Category: c.category,
      Classification: c.isBillable ? 'Billable (Client)' : 'Internal Overhead (Agency Absorbed)',
      'Total Hours': c.hours,
      'Share of Agency Time (%)': `${c.sharePercent}%`
    }));
    exportToCsv(`categories_${selectedMonth}`, rows);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
            Category Time Allocation & Absorption
          </h2>
          <p className="text-xs font-semibold text-[#16C098] mt-0.5">
            Total {totalHours.toLocaleString()} hours tracked across commercial vs internal categories
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Scrollable Table Body */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 border-t border-b border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white z-10 text-[#B5B7C0] font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4 text-right">Logged Hours</th>
              <th className="py-3 px-4 text-right">Agency Share</th>
              <th className="py-3 px-4 min-w-[220px]">Time Share Distribution</th>
              <th className="py-3 px-4 text-center">Treatment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#292D32]">
            {categories.map((c) => (
              <tr key={c.category} className="hover:bg-[#F9FBFF] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#111827]">{c.category}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold border ${
                      c.isBillable
                        ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {c.isBillable ? 'Billable (Project)' : 'Internal (Absorbed)'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                  {c.hours.toLocaleString()}h
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-[#5932EA]">
                  {c.sharePercent}%
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.isBillable ? 'bg-[#16C098]' : 'bg-[#5932EA]'}`}
                        style={{ width: `${Math.min(100, c.sharePercent)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                  {c.isBillable ? 'Direct Revenue' : 'Indirect Cost Pool'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
        <span>Showing {categories.length} categories</span>
        <div className="flex items-center gap-1.5">
          <button className="w-6 h-6 rounded-md bg-[#5932EA] text-white flex items-center justify-center text-xs font-bold">1</button>
        </div>
      </div>
    </div>
  );
};
