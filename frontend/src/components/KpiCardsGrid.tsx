'use client';

import React from 'react';
import { Clock, ShieldCheck, Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardMetrics } from '../types/dashboard';
import { MetricCard, MetricCardProps } from './common/MetricCard';

interface KpiCardsGridProps {
  metrics: DashboardMetrics;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ metrics }) => {
  const kpiConfigs: MetricCardProps[] = [
    {
      title: 'Total Hours',
      value: metrics.totalHours,
      suffix: 'h',
      decimals: 1,
      icon: Clock,
      iconBgColor: 'bg-[#EBF2FE]',
      iconTextColor: 'text-[#2563EB]',
      subtext: <span className="text-slate-500">All Staff Logged</span>
    },
    {
      title: 'Billable Hours',
      value: metrics.billableHours,
      suffix: 'h',
      decimals: 1,
      valueColor: 'text-[#06B6D4]',
      icon: ShieldCheck,
      iconBgColor: 'bg-[#E5F9FF]',
      iconTextColor: 'text-[#06B6D4]',
      subtext: (
        <span className="text-emerald-600 font-bold">
          {metrics.billableHoursPercent.toFixed(1)}% Productivity
        </span>
      )
    },
    {
      title: 'Total Cost',
      value: metrics.totalCost,
      prefix: 'AED ',
      decimals: 0,
      icon: Briefcase,
      iconBgColor: 'bg-[#FFF0EB]',
      iconTextColor: 'text-[#FF6A55]',
      subtext: <span className="text-slate-500">Direct + Indirect</span>
    },
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue,
      prefix: 'AED ',
      decimals: 0,
      valueColor: 'text-[#00AC4F]',
      icon: DollarSign,
      iconBgColor: 'bg-[#D3FFE7]',
      iconTextColor: 'text-[#00AC4F]',
      subtext: <span className="text-slate-500">{metrics.projectCount} Projects</span>
    },
    {
      title: 'Gross Margin',
      value: metrics.grossMarginPercent,
      suffix: '%',
      decimals: 1,
      valueColor: 'text-[#5932EA]',
      icon: TrendingUp,
      iconBgColor: 'bg-[#E7EDFF]',
      iconTextColor: 'text-[#5932EA]',
      subtext: (
        <span className="text-[#5932EA] font-bold">
          Profit: AED {Math.round(metrics.totalProfit).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5 flex-shrink-0">
      {kpiConfigs.map((config) => (
        <MetricCard key={config.title} {...config} />
      ))}
    </div>
  );
};
