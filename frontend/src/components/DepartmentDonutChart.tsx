'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DepartmentItem } from '../types/dashboard';
import { DollarSign, Clock, ArrowUpRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DepartmentDonutChartProps {
  departments: DepartmentItem[];
  activeDept: string | null;
  onSelectDept: (deptName: string) => void;
  metricMode: 'cost' | 'hours';
  setMetricMode: (mode: 'cost' | 'hours') => void;
}

const DEPT_COLORS: Record<string, { color: string; bg: string; text: string }> = {
  Design: { color: '#06B6D4', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  Frontend: { color: '#5932EA', bg: 'bg-purple-50', text: 'text-purple-700' },
  Backend: { color: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-700' },
  App: { color: '#EC4899', bg: 'bg-pink-50', text: 'text-pink-700' },
  QA: { color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' },
  Management: { color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' }
};

const FALLBACK_PALETTE = ['#8B5CF6', '#14B8A6', '#F97316', '#6366F1', '#E11D48'];

export const DepartmentDonutChart: React.FC<DepartmentDonutChartProps> = ({
  departments,
  activeDept,
  onSelectDept,
  metricMode,
  setMetricMode
}) => {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const totalCost = departments.reduce((acc, d) => acc + d.cost, 0);
  const totalHours = departments.reduce((acc, d) => acc + d.totalHours, 0);
  const currentTotal = metricMode === 'cost' ? totalCost : totalHours;

  const currentDisplayDept = hoveredDept
    ? departments.find((d) => d.department === hoveredDept)
    : activeDept
    ? departments.find((d) => d.department === activeDept)
    : null;

  // Department color mapping helper
  const getColor = (deptName: string, idx: number) => {
    return (
      DEPT_COLORS[deptName]?.color ||
      FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length]
    );
  };

  // Prepare Chart.js dataset
  const chartLabels = departments.map((d) => d.department);
  const chartValues = departments.map((d) =>
    metricMode === 'cost' ? d.cost : d.totalHours
  );
  const chartColors = departments.map((d, i) => getColor(d.department, i));

  const doughnutData: ChartData<'doughnut'> = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '72%',
    animation: {
      duration: 500
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0F172A',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12,
        boxPadding: 4,
        callbacks: {
          label: (item) => {
            const val = Number(item.raw) || 0;
            const share = currentTotal > 0 ? ((val / currentTotal) * 100).toFixed(1) : '0';
            if (metricMode === 'cost') {
              return ` Cost: AED ${val.toLocaleString()} (${share}%)`;
            }
            return ` Hours: ${val.toLocaleString()}h (${share}%)`;
          }
        }
      }
    },
    onClick: (_event, elements) => {
      if (elements && elements.length > 0) {
        const idx = elements[0].index;
        const clickedDept = departments[idx]?.department;
        if (clickedDept) {
          onSelectDept(clickedDept);
        }
      }
    }
  };

  return (
    <div className="bg-[#FBFBFF] rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-5 flex-shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Top Bar: Title & Metric Toggle */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Department Allocation Distribution
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Powered by Chart.js Doughnut
          </span>
        </div>

        {/* Toggle Cost vs Hours */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-sm">
          <button
            onClick={() => setMetricMode('cost')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              metricMode === 'cost'
                ? 'bg-[#5932EA] text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cost (AED)</span>
          </button>
          <button
            onClick={() => setMetricMode('hours')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              metricMode === 'hours'
                ? 'bg-[#5932EA] text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hours (h)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Chart.js Doughnut + Right Legend Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Chart.js Doughnut */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[210px] h-[210px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />

            {/* Center Information Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {currentDisplayDept ? (
                <div className="animate-float-in">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {currentDisplayDept.department}
                  </span>
                  <span className="text-base font-extrabold text-[#111827] block tracking-tight">
                    {metricMode === 'cost'
                      ? `AED ${currentDisplayDept.cost.toLocaleString()}`
                      : `${currentDisplayDept.totalHours.toLocaleString()}h`}
                  </span>
                  <span className="text-[10px] font-bold text-[#5932EA] block">
                    {currentTotal > 0
                      ? (
                          ((metricMode === 'cost'
                            ? currentDisplayDept.cost
                            : currentDisplayDept.totalHours) /
                            currentTotal) *
                          100
                        ).toFixed(1)
                      : '0'}
                    % Share
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Agency
                  </span>
                  <span className="text-sm font-extrabold text-[#111827] block tracking-tight">
                    {metricMode === 'cost'
                      ? `AED ${totalCost.toLocaleString()}`
                      : `${totalHours.toLocaleString()}h`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {departments.length} Departments
                  </span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-2">
            Tip: Click slice to auto-expand department
          </span>
        </div>

        {/* Right: Interactive Legend & Share Progress Bars */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {departments.map((dept, idx) => {
            const isSelected = activeDept === dept.department;
            const isHovered = hoveredDept === dept.department;
            const colorHex = getColor(dept.department, idx);
            const val = metricMode === 'cost' ? dept.cost : dept.totalHours;
            const percentage =
              currentTotal > 0 ? Number(((val / currentTotal) * 100).toFixed(1)) : 0;

            return (
              <div
                key={dept.department}
                onMouseEnter={() => setHoveredDept(dept.department)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => onSelectDept(dept.department)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white border-[#5932EA] shadow-md ring-1 ring-[#5932EA]/20'
                    : isHovered
                    ? 'bg-white border-slate-300 shadow-sm'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="text-xs font-extrabold text-[#111827]">
                      {dept.department}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                      {dept.employeeCount} staff
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#111827]">
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colorHex
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>
                    {metricMode === 'cost'
                      ? `AED ${dept.cost.toLocaleString()}`
                      : `${dept.totalHours.toLocaleString()}h`}
                  </span>
                  <span className="text-[#5932EA] font-bold text-[10px] flex items-center gap-0.5 group-hover:underline">
                    {isSelected ? 'Expanded' : 'Drill-down'}
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
