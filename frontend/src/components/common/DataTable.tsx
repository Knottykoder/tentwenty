'use client';

import React from 'react';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  // Header bar (Optional)
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  // Layout & Styling
  variant?: 'card' | 'embedded';
  className?: string;
  maxHeight?: string;
  emptyMessage?: string;
  // Footer (Optional)
  showFooter?: boolean;
  footerText?: React.ReactNode;
  customFooter?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  onRowClick,
  title,
  subtitle,
  actions,
  variant = 'card',
  className = '',
  maxHeight,
  emptyMessage = 'No records found for this period.',
  showFooter = false,
  footerText,
  customFooter
}: DataTableProps<T>) {
  const isCard = variant === 'card';

  const containerClasses = isCard
    ? `flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${className}`
    : `flex flex-col bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden ${className}`;

  const scrollWrapperClasses = maxHeight
    ? `overflow-x-auto overflow-y-auto ${maxHeight}`
    : isCard
    ? 'flex-1 overflow-y-auto overflow-x-auto min-h-0 border-t border-b border-slate-100'
    : 'overflow-x-auto overflow-y-auto';

  return (
    <div className={containerClasses}>
      {/* Optional Table Header Bar */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 flex-shrink-0">
          <div>
            {typeof title === 'string' ? (
              <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
                {title}
              </h2>
            ) : (
              title
            )}
            {subtitle && (
              typeof subtitle === 'string' ? (
                <p className="text-xs font-semibold text-[#16C098] mt-0.5">
                  {subtitle}
                </p>
              ) : (
                subtitle
              )
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table Body / Scroll Area */}
      <div className={scrollWrapperClasses}>
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10 text-[#B5B7C0] font-semibold text-[11px] border-b border-slate-100">
            <tr>
              {columns.map((col, idx) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';
                return (
                  <th
                    key={idx}
                    className={`py-3 px-4 ${alignClass} ${col.headerClassName || ''}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#292D32]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-xs font-semibold text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const key = getRowKey ? getRowKey(row, rowIdx) : rowIdx;
                const isClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-[#F9FBFF] transition-colors ${
                      isClickable ? 'cursor-pointer group' : ''
                    }`}
                  >
                    {columns.map((col, colIdx) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      const cellContent = col.cell
                        ? col.cell(row, rowIdx)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null;

                      return (
                        <td
                          key={colIdx}
                          className={`py-3.5 px-4 ${alignClass} ${col.className || ''}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Table Footer Bar */}
      {showFooter && (
        <div className="flex items-center justify-between pt-4 text-xs text-[#B5B7C0] font-semibold flex-shrink-0">
          <span>{footerText || `Showing ${data.length} records`}</span>
          {customFooter}
        </div>
      )}
    </div>
  );
}
