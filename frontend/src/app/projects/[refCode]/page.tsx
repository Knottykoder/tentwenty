'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Download,
  Clock,
  DollarSign,
  TrendingUp,
  Layers,
  Users,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ProjectMetric } from '../../../types/dashboard';
import { exportToCsv } from '../../../utils/exportCsv';
import { useApiData } from '../../../hooks/useApiData';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/common/LoadingState';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refCode = params?.refCode as string;

  const { data, loading, error } = useApiData(
    () => (refCode ? apiClient.getProjectDetail(refCode) : Promise.resolve(null)),
    [refCode]
  );

  if (loading) {
    return <LoadingState message="Loading project economics & breakdown..." />;
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Project Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Could not find project records matching ref code &quot;{refCode}&quot;.
        </p>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5932EA] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#4825cc] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to All Projects
        </Link>
      </div>
    );
  }

  const { project, timeline } = data;
  const isProfitable = project.profit >= 0;

  const handleExportContributions = () => {
    const rows = project.employeeContributions.map((c) => ({
      'Employee No': c.employeeNo,
      'Employee Name': c.employeeName,
      Department: c.department,
      'Hours Logged': c.hours,
      'Total Cost (AED)': c.cost,
      'Revenue Share (AED)': c.revenueShare,
      'Profit (AED)': c.profit,
      'Margin (%)': `${c.profitabilityMargin}%`
    }));
    exportToCsv(`${project.refCode}_economics_breakdown`, rows);
  };

  // Timeline Chart Data
  const timelineChartData: ChartData<'bar'> = {
    labels: timeline.map((t) => t.month),
    datasets: [
      {
        label: 'Hours Logged',
        data: timeline.map((t) => t.hours),
        backgroundColor: '#5932EA',
        borderRadius: 6,
        yAxisID: 'y'
      },
      {
        label: 'Cost (AED)',
        data: timeline.map((t) => t.cost),
        backgroundColor: '#10B981',
        borderRadius: 6,
        yAxisID: 'y1'
      }
    ]
  };

  const timelineChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: { size: 10, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0F172A',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        position: 'left',
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { size: 9 },
          callback: (val) => `${val}h`
        }
      },
      y1: {
        position: 'right',
        grid: { display: false },
        ticks: {
          font: { size: 9 },
          callback: (val) => {
            const n = Number(val);
            return n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
          }
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-y-auto space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Projects</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#5932EA]/10 text-[#5932EA] border border-[#5932EA]/20">
              {project.refCode}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {project.category}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                project.status.toLowerCase().includes('complete')
                  ? 'bg-[#16C098]/10 text-[#008767] border-[#00B087]/30'
                  : 'bg-[#FFC5C5]/20 text-[#DF0404] border-[#FFC5C5]'
              }`}
            >
              {project.status}
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Sales Month: {project.salesMonth}
            </span>
          </div>
        </div>

        <button
          onClick={handleExportContributions}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Breakdown CSV</span>
        </button>
      </div>

      {/* Project Title */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-[#5932EA] flex-shrink-0" />
          {project.projectName}
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Contract Financial Economics, Monthly Spend Trajectory & Headcount Allocation
        </p>
      </div>

      {/* 4 Commercial Metrics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-shrink-0">
        {/* 1. Price */}
        <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Contract Price
          </span>
          <p className="text-xl font-extrabold text-[#111827] mt-1 font-mono">
            AED {project.price.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Agreed Commercial Value
          </span>
        </div>

        {/* 2. Total Hours */}
        <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Logged Hours
          </span>
          <p className="text-xl font-extrabold text-[#5932EA] mt-1 font-mono">
            {project.totalHours.toLocaleString()}h
          </p>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Timesheet Tracked
          </span>
        </div>

        {/* 3. Total Cost */}
        <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Loaded Cost
          </span>
          <p className="text-xl font-extrabold text-slate-800 mt-1 font-mono">
            AED {project.totalCost.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Direct + Overhead Absorbed
          </span>
        </div>

        {/* 4. Profit & Margin */}
        <div
          className={`rounded-2xl border p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${
            isProfitable
              ? 'border-emerald-200/80 bg-emerald-50/40'
              : 'border-red-200/80 bg-red-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Profit
            </span>
            <span
              className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                isProfitable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {project.margin}% Margin
            </span>
          </div>
          <p
            className={`text-xl font-extrabold mt-1 font-mono ${
              isProfitable ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            AED {project.profit.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Price − Total Loaded Cost
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid: Monthly Burn Timeline + Department Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-shrink-0">
        {/* Left: Monthly Timeline Spend (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-[#FAFAFC] p-4 flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5932EA]" />
              Monthly Spend & Burn Trajectory
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Hours Logged vs Fully-Loaded Cost (AED)
            </span>
          </div>
          <div className="flex-1 min-h-[160px] relative">
            {timeline.length > 0 ? (
              <Bar data={timelineChartData} options={timelineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-medium">
                No monthly timeline records available.
              </div>
            )}
          </div>
        </div>

        {/* Right: Department Distribution Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-[#FAFAFC] p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#06B6D4]" />
            Department Time Distribution
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {Object.entries(project.departmentHours).map(([dept, hours]) => {
              const pct = project.totalHours > 0 ? (hours / project.totalHours) * 100 : 0;
              return (
                <div
                  key={dept}
                  className="rounded-xl bg-white border border-slate-200 p-2.5 flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-slate-800 truncate">{dept}</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm font-extrabold text-[#5932EA] font-mono">
                      {hours.toFixed(1)}h
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full bg-[#5932EA]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Employee Contribution & Profitability Table */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-xs flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-[#F9FBFF]">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5932EA]" />
              Employee Level Contribution & Profitability
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Revenue Share = Contract Price × (Hours ÷ Total Hours) • Net Profit = Revenue Share − Loaded Cost
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {project.employeeContributions.length} Contributors
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white text-[#B5B7C0] font-semibold text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Staff Member</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-right">Logged Hours</th>
                <th className="py-2.5 px-4 text-right">Loaded Cost</th>
                <th className="py-2.5 px-4 text-right">Revenue Share</th>
                <th className="py-2.5 px-4 text-right">Net Profit</th>
                <th className="py-2.5 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#292D32]">
              {project.employeeContributions.map((emp) => {
                const empProfitable = emp.profit >= 0;
                return (
                  <tr key={emp.employeeName} className="hover:bg-[#F9FBFF] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">
                      {emp.employeeName}
                      <span className="text-[10px] text-slate-400 font-mono ml-2 font-normal">
                        #{emp.employeeNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{emp.department}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                      {emp.hours}h
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      AED {emp.cost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111827]">
                      AED {emp.revenueShare.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        empProfitable ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      AED {emp.profit.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-extrabold ${
                        empProfitable ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {emp.profitabilityMargin}%
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
}
