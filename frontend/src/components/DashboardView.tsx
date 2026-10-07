'use client';

import React, { useState } from 'react';
import { Search, Download, ExternalLink, Filter } from 'lucide-react';
import { ProjectMetric } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface DashboardViewProps {
  projects: ProjectMetric[];
  onSelectProject: (p: ProjectMetric) => void;
  selectedMonth: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  selectedMonth
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.refCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    const rows = filtered.map((p) => ({
      'Ref Code': p.refCode,
      'Project Name': p.projectName,
      Category: p.category,
      Status: p.status,
      'Sales Month': p.salesMonth,
      'Price (AED)': p.price,
      'Total Hours': p.totalHours,
      'Total Cost (AED)': p.totalCost,
      'Profit (AED)': p.profit,
      'Margin (%)': `${p.margin}%`
    }));
    exportToCsv(`agency_projects_${selectedMonth}`, rows);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Table Card Header matching screenshot ("All Customers") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
            All Agency Projects
          </h2>
          <p className="text-xs font-semibold text-[#16C098] mt-0.5">
            Active Accounts & Commercial Contracts
          </p>
        </div>

        {/* Right Search, Filter, Export Controls */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-800 outline-none placeholder:text-slate-400 font-medium w-36 sm:w-44"
            />
          </div>

          {/* Short / Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400 font-normal">Sort by :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Scrollable Table Area (Whole page doesn't scroll, only rows scroll!) */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 border-t border-b border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white z-10 text-[#B5B7C0] font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Ref Code</th>
              <th className="py-3 px-4">Project / Commercial Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Contract Price</th>
              <th className="py-3 px-4 text-right">Logged Hours</th>
              <th className="py-3 px-4 text-right">Direct+Indirect Cost</th>
              <th className="py-3 px-4 text-right">Net Profit</th>
              <th className="py-3 px-4 text-right">Gross Margin</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#292D32]">
            {filtered.map((p) => {
              const isCompleted = p.status.toLowerCase().includes('complete');
              return (
                <tr
                  key={p.refCode}
                  onClick={() => onSelectProject(p)}
                  className="hover:bg-[#F9FBFF] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5932EA]">
                    {p.refCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827] max-w-xs truncate">
                    {p.projectName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                    AED {p.price.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600">
                    {p.totalHours.toLocaleString()}h
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    AED {p.totalCost.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                    AED {p.profit.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#111827]">
                    {p.margin}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold border ${
                        isCompleted
                          ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                          : 'bg-[#FFC5C5]/20 text-[#DF0404] border-[#FFC5C5]'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button className="text-[#5932EA] text-xs font-bold group-hover:underline flex items-center justify-center gap-1 mx-auto">
                      View
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer matching screenshot */}
      <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
        <span>
          Showing {filtered.length} of {projects.length} total entries
        </span>
        <div className="flex items-center gap-1.5">
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200">
            &lt;
          </button>
          <button className="w-6 h-6 rounded-md bg-[#5932EA] text-white flex items-center justify-center text-xs font-bold">
            1
          </button>
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200">
            2
          </button>
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
