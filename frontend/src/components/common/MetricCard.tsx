'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedMetricNumber } from '../AnimatedMetricNumber';

export interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext: React.ReactNode;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  decimals = 0,
  subtext,
  icon: Icon,
  iconBgColor,
  iconTextColor,
  valueColor = 'text-[#333333]'
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-3.5 card-float-transition">
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor} ${iconTextColor}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] text-[#ACACAC] font-medium block truncate">
          {title}
        </span>
        <h3 className={`text-lg font-bold tracking-tight truncate ${valueColor}`}>
          <AnimatedMetricNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </h3>
        <div className="text-[10px] font-semibold block truncate mt-0.5">
          {subtext}
        </div>
      </div>
    </div>
  );
};
