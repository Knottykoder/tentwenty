'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import { ProjectMetric } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';
import { DataTable } from './common/DataTable';
import { SearchInput } from './common/SearchInput';

interface ProjectsViewProps {
  projects: ProjectMetric[];
  onSelectProject?: (p: ProjectMetric) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = Array.from(new Set(projects.map((p) => p.category)));

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.refCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCat =
      categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
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
    <DataTable<ProjectMetric>
      title="Commercial Projects & Margin Breakdown"
      subtitle="Click any project row to view department hours & employee contribution"
      actions={
        <>
          <SearchInput
            placeholder="Search project..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

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
                <option key={c} value={c}>
                  {c}
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
      getRowKey={(p) => p.refCode}
      onRowClick={(p) => router.push(`/projects/${encodeURIComponent(p.refCode)}`)}
      columns={[
        {
          header: 'Ref Code',
          className: 'font-mono font-bold text-[#5932EA]',
          accessorKey: 'refCode'
        },
        {
          header: 'Project Name',
          className: 'font-bold text-[#111827] max-w-xs truncate',
          accessorKey: 'projectName'
        },
        {
          header: 'Category',
          className: 'text-slate-500 font-medium',
          accessorKey: 'category'
        },
        {
          header: 'Price',
          align: 'right',
          className: 'font-mono font-bold text-[#111827]',
          cell: (p) => `AED ${p.price.toLocaleString()}`
        },
        {
          header: 'Hours',
          align: 'right',
          className: 'font-mono font-medium text-slate-600',
          cell: (p) => `${p.totalHours.toLocaleString()}h`
        },
        {
          header: 'Total Cost',
          align: 'right',
          className: 'font-mono text-slate-600',
          cell: (p) => `AED ${p.totalCost.toLocaleString()}`
        },
        {
          header: 'Profit',
          align: 'right',
          className: 'font-mono font-bold text-emerald-600',
          cell: (p) => `AED ${p.profit.toLocaleString()}`
        },
        {
          header: 'Margin',
          align: 'right',
          className: 'font-mono font-extrabold text-[#111827]',
          cell: (p) => `${p.margin}%`
        },
        {
          header: 'Status',
          align: 'center',
          cell: (p) => {
            const isCompleted = p.status.toLowerCase().includes('complete');
            return (
              <span
                className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold border ${
                  isCompleted
                    ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                    : 'bg-[#FFC5C5]/20 text-[#DF0404] border-[#FFC5C5]'
                }`}
              >
                {isCompleted ? 'Completed' : 'In Progress'}
              </span>
            );
          }
        },
        {
          header: 'Action',
          align: 'center',
          cell: (p) => (
            <Link
              href={`/projects/${encodeURIComponent(p.refCode)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#5932EA] text-xs font-bold group-hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              View
              <ExternalLink className="w-3 h-3" />
            </Link>
          )
        }
      ]}
      showFooter
      footerText={`Showing ${filtered.length} of ${projects.length} entries`}
    />
  );
};
