'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MonthlyTrend } from '../types/dashboard';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueCostLineChartProps {
  trends: MonthlyTrend[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec'
};

export const RevenueCostLineChart: React.FC<RevenueCostLineChartProps> = ({
  trends,
  selectedMonth,
  onSelectMonth
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMarginLine, setShowMarginLine] = useState(true);

  if (!trends || trends.length === 0) return null;

  const labels = trends.map((t) => {
    const mm = t.month.split('-')[1] || t.month;
    return MONTH_LABELS[mm] || mm;
  });

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: trends.map((t) => t.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.38,
        yAxisID: 'y',
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#10B981',
        pointBorderWidth: 2,
        pointRadius: (ctx) => (trends[ctx.dataIndex]?.month === selectedMonth ? 6 : 4),
        pointHoverRadius: 7
      },
      {
        label: 'Total Cost',
        data: trends.map((t) => t.cost),
        borderColor: '#FF6A55',
        backgroundColor: 'transparent',
        borderDash: [5, 4],
        fill: false,
        tension: 0.38,
        yAxisID: 'y',
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#FF6A55',
        pointBorderWidth: 2,
        pointRadius: (ctx) => (trends[ctx.dataIndex]?.month === selectedMonth ? 5 : 3.5),
        pointHoverRadius: 6
      },
      ...(showMarginLine
        ? [
            {
              label: 'Gross Margin %',
              data: trends.map((t) => t.margin),
              borderColor: '#5932EA',
              backgroundColor: 'transparent',
              borderWidth: 2,
              fill: false,
              tension: 0.38,
              yAxisID: 'y1',
              pointBackgroundColor: '#5932EA',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 1.5,
              pointRadius: (ctx: any) =>
                trends[ctx.dataIndex]?.month === selectedMonth ? 4.5 : 2.5,
              pointHoverRadius: 5
            }
          ]
        : [])
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450
    },
    interaction: {
      mode: 'index',
      intersect: false
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
        usePointStyle: true,
        titleFont: {
          weight: 'bold',
          size: 11
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const idx = items[0].dataIndex;
            const trend = trends[idx];
            return trend ? `Period: ${trend.month}` : items[0].label;
          },
          label: (item) => {
            const val = Number(item.raw) || 0;
            if (item.dataset.yAxisID === 'y1') {
              return ` ${item.dataset.label}: ${val.toFixed(1)}%`;
            }
            return ` ${item.dataset.label}: AED ${val.toLocaleString()}`;
          },
          afterBody: (items) => {
            if (!items.length) return '';
            const idx = items[0].dataIndex;
            const trend = trends[idx];
            if (!trend) return '';
            return ` Net Profit: AED ${trend.profit.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#F8FAFC',
          lineWidth: 1
        },
        ticks: {
          color: (ctx) => {
            const idx = ctx.index;
            return trends[idx]?.month === selectedMonth ? '#5932EA' : '#94A3B8';
          },
          font: {
            size: 10,
            weight: 600
          }
        }
      },
      y: {
        position: 'left',
        grid: {
          color: '#F1F5F9',
          lineWidth: 1
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 9
          },
          callback: (val) => {
            const n = Number(val);
            if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
            if (n >= 1000) return `${Math.round(n / 1000)}k`;
            return `${n}`;
          }
        }
      },
      y1: {
        position: 'right',
        display: showMarginLine,
        min: 0,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          color: '#8B5CF6',
          font: {
            size: 9
          },
          callback: (val) => `${val}%`
        }
      }
    },
    onClick: (_event, elements) => {
      if (elements && elements.length > 0) {
        const idx = elements[0].index;
        const clickedMonth = trends[idx]?.month;
        if (clickedMonth) {
          onSelectMonth(clickedMonth);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-5 flex-shrink-0 transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EBF2FE] text-[#2563EB] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-[#5932EA]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] tracking-tight flex items-center gap-2">
              12-Month Financial Trajectory (Revenue vs Cost)
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Powered by Chart.js • Click any month point to focus dashboard filters
            </span>
          </div>
        </div>

        {/* Legend & Controls */}
        <div className="flex items-center gap-3 text-[11px] font-semibold flex-wrap">
          {/* Revenue Indicator */}
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-xs" />
            <span>Revenue</span>
          </div>

          {/* Cost Indicator */}
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A55] shadow-xs" />
            <span>Cost</span>
          </div>

          {/* Margin Toggle */}
          <button
            onClick={() => setShowMarginLine(!showMarginLine)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] transition-colors cursor-pointer ${
              showMarginLine
                ? 'border-[#5932EA]/30 bg-[#5932EA]/10 text-[#5932EA] font-bold'
                : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#5932EA] rounded-full" />
            <span>Margin % Curve</span>
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            title={isCollapsed ? 'Expand Trend Chart' : 'Collapse Trend Chart'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart.js Canvas Container */}
      {!isCollapsed && (
        <div className="w-full h-[155px] relative mt-1">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};
