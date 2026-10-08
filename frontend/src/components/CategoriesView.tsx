'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { CategoryItem } from '../types/dashboard';
import { exportToCsv } from '../utils/exportCsv';
import { DataTable } from './common/DataTable';

interface CategoriesViewProps {
  categories: CategoryItem[];
  totalHours: number;
  selectedMonth: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  totalHours,
  selectedMonth
}) => {
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
    <DataTable<CategoryItem>
      title="Category Time Allocation & Absorption"
      subtitle={`Total ${totalHours.toLocaleString()} hours tracked across commercial vs internal categories`}
      actions={
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      }
      data={categories}
      getRowKey={(c) => c.category}
      columns={[
        {
          header: 'Category Name',
          className: 'font-bold text-[#111827]',
          accessorKey: 'category'
        },
        {
          header: 'Classification',
          cell: (c) => (
            <span
              className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold border ${
                c.isBillable
                  ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {c.isBillable ? 'Billable (Project)' : 'Internal (Absorbed)'}
            </span>
          )
        },
        {
          header: 'Logged Hours',
          align: 'right',
          className: 'font-mono font-bold text-[#111827]',
          cell: (c) => `${c.hours.toLocaleString()}h`
        },
        {
          header: 'Agency Share',
          align: 'right',
          className: 'font-mono font-bold text-[#5932EA]',
          cell: (c) => `${c.sharePercent}%`
        },
        {
          header: 'Time Share Distribution',
          headerClassName: 'min-w-[220px]',
          cell: (c) => (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    c.isBillable ? 'bg-[#16C098]' : 'bg-[#5932EA]'
                  }`}
                  style={{ width: `${Math.min(100, c.sharePercent)}%` }}
                />
              </div>
            </div>
          )
        },
        {
          header: 'Treatment',
          align: 'center',
          className: 'text-slate-500 font-medium',
          cell: (c) => (c.isBillable ? 'Direct Revenue' : 'Indirect Cost Pool')
        }
      ]}
      showFooter
      footerText={`Showing ${categories.length} categories`}
    />
  );
};
