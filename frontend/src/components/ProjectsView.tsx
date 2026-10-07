'use client';

import React, { useState } from 'react';
import { Briefcase, Download, Search, Filter, ExternalLink } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-1 items-center gap-2 max-w-md bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name or ref code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="in progress" className="bg-slate-900">In Progress</option>
              <option value="completed" className="bg-slate-900">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Ref Code</th>
                <th className="py-3 px-3.5">Project Name</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Price</th>
                <th className="py-3 px-3.5 text-right">Hours</th>
                <th className="py-3 px-3.5 text-right">Total Cost</th>
                <th className="py-3 px-3.5 text-right">Profit</th>
                <th className="py-3 px-3.5 text-right">Margin</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((p) => {
                const isProfitable = p.profit >= 0;
                return (
                  <tr
                    key={p.refCode}
                    onClick={() => onSelectProject(p)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3.5 font-mono font-medium text-emerald-400">
                      {p.refCode}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-white max-w-xs truncate">
                      {p.projectName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400">{p.category}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          p.status === 'completed'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-medium text-white">
                      AED {p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">{p.totalHours.toLocaleString()}h</td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                      AED {p.totalCost.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right font-mono font-medium ${
                        isProfitable ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      AED {p.profit.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right font-mono font-semibold ${
                        isProfitable ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {p.margin}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="text-[11px] text-emerald-400 group-hover:underline flex items-center justify-center gap-1">
                        View
                        <ExternalLink className="w-3 h-3" />
                      </span>
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
