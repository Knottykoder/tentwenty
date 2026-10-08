'use client';

import React from 'react';
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
import { CategoryItem } from '../types/dashboard';
import { Layers } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CategoryBarChartProps {
  categories: CategoryItem[];
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  const topCategories = categories.slice(0, 7);
  const labels = topCategories.map((c) => c.category);
  const data = topCategories.map((c) => c.hours);
  const backgroundColors = topCategories.map((c) =>
    c.isBillable ? '#10B981' : '#5932EA'
  );

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Hours Logged',
        data,
        backgroundColor: backgroundColors,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 18
      }
    ]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
        callbacks: {
          label: (item) => {
            const cat = topCategories[item.dataIndex];
            const val = Number(item.raw) || 0;
            const type = cat?.isBillable ? 'Billable' : 'Absorbed';
            return ` ${val.toLocaleString()} hrs (${type} - ${cat?.sharePercent}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 10,
            weight: 600
          }
        }
      },
      y: {
        grid: {
          color: '#F1F5F9'
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 9
          },
          callback: (val) => `${val}h`
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-4 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#5932EA] flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] tracking-tight">
              Category Time Allocation
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Billable vs Internal Agency Overhead
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>Billable</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5932EA]" />
            <span>Internal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[140px] relative">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
