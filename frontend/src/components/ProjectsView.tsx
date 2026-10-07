'use client';

import React, { useState } from 'react';
import { Search, Download, ExternalLink } from 'lucide-react';
import { ProjectMetric } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';

interface ProjectsViewProps {
  projects: ProjectMetric[];
  onSelectProject: (p: ProjectMetric) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = Array.from(new Set(projects.map((p) => p.category)));

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.refCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCat = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCat;
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
    exportToCsv('projects_profitability', rows);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
            Commercial Projects & Margin Breakdown
          </h2>
          <p className="text-xs font-semibold text-[#16C098] mt-0.5">
            Click any project row to view department hours & employee contribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-800 outline-none placeholder:text-slate-400 font-medium w-36"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
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

          <div className="flex items-center gap-1.5 bg-[#F9FBFF] border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
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
              <th className="py-3 px-4">Ref Code</th>
              <th className="py-3 px-4">Project Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">Hours</th>
              <th className="py-3 px-4 text-right">Total Cost</th>
              <th className="py-3 px-4 text-right">Profit</th>
              <th className="py-3 px-4 text-right">Margin</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
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
                  <td className="py-3 px-4 font-mono font-bold text-[#5932EA]">
                    {p.refCode}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#111827] max-w-xs truncate">
                    {p.projectName}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {p.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#111827]">
                    AED {p.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-600">
                    {p.totalHours.toLocaleString()}h
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    AED {p.totalCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                    AED {p.profit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#111827]">
                    {p.margin}%
                  </td>
                  <td className="py-3 px-4 text-center">
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
                  <td className="py-3 px-4 text-center">
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

      {/* Table Footer */}
      <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
        <span>Showing {filtered.length} of {projects.length} entries</span>
        <div className="flex items-center gap-1.5">
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200">&lt;</button>
          <button className="w-6 h-6 rounded-md bg-[#5932EA] text-white flex items-center justify-center text-xs font-bold">1</button>
          <button className="w-6 h-6 rounded-md bg-[#F5F5F5] text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200">&gt;</button>
        </div>
      </div>
    </div>
  );
};
