'use client';

import React, { useState } from 'react';
import { DepartmentItem } from '../types/dashboard';
import { DollarSign, Clock, Users, ArrowUpRight } from 'lucide-react';

interface DepartmentDonutChartProps {
  departments: DepartmentItem[];
  activeDept: string | null;
  onSelectDept: (deptName: string) => void;
  metricMode: 'cost' | 'hours';
  setMetricMode: (mode: 'cost' | 'hours') => void;
}

const DEPT_COLORS: Record<string, { stroke: string; fill: string; bg: string; text: string }> = {
  Design: { stroke: '#06B6D4', fill: '#06B6D4', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  Frontend: { stroke: '#5932EA', fill: '#5932EA', bg: 'bg-purple-50', text: 'text-purple-700' },
  Backend: { stroke: '#2563EB', fill: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-700' },
  App: { stroke: '#EC4899', fill: '#EC4899', bg: 'bg-pink-50', text: 'text-pink-700' },
  QA: { stroke: '#F59E0B', fill: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' },
  Management: { stroke: '#10B981', fill: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' }
};

const DEFAULT_COLOR = { stroke: '#8B5CF6', fill: '#8B5CF6', bg: 'bg-indigo-50', text: 'text-indigo-700' };

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

  // Compute slice angles
  let cumulativeAngle = 0;
  const slices = departments.map((dept) => {
    const val = metricMode === 'cost' ? dept.cost : dept.totalHours;
    const fraction = currentTotal > 0 ? val / currentTotal : 0;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    return {
      department: dept.department,
      val,
      fraction,
      percentage: Number((fraction * 100).toFixed(1)),
      startAngle,
      endAngle,
      item: dept
    };
  });

  // SVG parameters
  const size = 220;
  const center = size / 2;
  const outerRadius = 95;
  const innerRadius = 65;

  const currentDisplayDept = hoveredDept
    ? departments.find((d) => d.department === hoveredDept)
    : activeDept
    ? departments.find((d) => d.department === activeDept)
    : null;

  return (
    <div className="bg-[#FBFBFF] rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-5 flex-shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Top Bar: Title & Toggle */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Department Allocation Distribution
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

      {/* Main Grid: Left Donut + Right Legend Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: SVG Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[220px] h-[220px]">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 filter drop-shadow-sm"
            >
              {slices.map((s) => {
                const isSelected = activeDept === s.department;
                const isHovered = hoveredDept === s.department;
                const isHighlighted = isSelected || isHovered;
                const color = DEPT_COLORS[s.department] || DEFAULT_COLOR;

                // Arc calculation
                const gap = slices.length > 1 ? 0.025 : 0; // slight slice separation gap
                const actualStart = s.startAngle + gap;
                const actualEnd = Math.max(s.endAngle - gap, actualStart);

                const currentOuterRadius = isHighlighted ? outerRadius + 4 : outerRadius;
                const currentInnerRadius = isHighlighted ? innerRadius - 2 : innerRadius;

                const x1 = center + currentOuterRadius * Math.cos(actualStart);
                const y1 = center + currentOuterRadius * Math.sin(actualStart);
                const x2 = center + currentOuterRadius * Math.cos(actualEnd);
                const y2 = center + currentOuterRadius * Math.sin(actualEnd);

                const x3 = center + currentInnerRadius * Math.cos(actualEnd);
                const y3 = center + currentInnerRadius * Math.sin(actualEnd);
                const x4 = center + currentInnerRadius * Math.cos(actualStart);
                const y4 = center + currentInnerRadius * Math.sin(actualStart);

                const largeArc = s.fraction > 0.5 ? 1 : 0;

                const pathData = `
                  M ${x1} ${y1}
                  A ${currentOuterRadius} ${currentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}
                  L ${x3} ${y3}
                  A ${currentInnerRadius} ${currentInnerRadius} 0 ${largeArc} 0 ${x4} ${y4}
                  Z
                `;

                return (
                  <path
                    key={s.department}
                    d={pathData}
                    fill={color.fill}
                    className="cursor-pointer transition-all duration-200"
                    opacity={hoveredDept && !isHovered ? 0.5 : 1}
                    onMouseEnter={() => setHoveredDept(s.department)}
                    onMouseLeave={() => setHoveredDept(null)}
                    onClick={() => onSelectDept(s.department)}
                  />
                );
              })}
            </svg>

            {/* Center Information */}
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
                    {slices.find((s) => s.department === currentDisplayDept.department)?.percentage}% Share
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
                    6 Departments
                  </span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            Tip: Click slice to auto-expand department
          </span>
        </div>

        {/* Right: Interactive Legend & Share Bars */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {slices.map((s) => {
            const isSelected = activeDept === s.department;
            const isHovered = hoveredDept === s.department;
            const color = DEPT_COLORS[s.department] || DEFAULT_COLOR;

            return (
              <div
                key={s.department}
                onMouseEnter={() => setHoveredDept(s.department)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => onSelectDept(s.department)}
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
                      style={{ backgroundColor: color.fill }}
                    />
                    <span className="text-xs font-extrabold text-[#111827]">
                      {s.department}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                      {s.item.employeeCount} staff
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#111827]">
                    {s.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${s.percentage}%`,
                      backgroundColor: color.fill
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>
                    {metricMode === 'cost'
                      ? `AED ${s.item.cost.toLocaleString()}`
                      : `${s.item.totalHours.toLocaleString()}h`}
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
