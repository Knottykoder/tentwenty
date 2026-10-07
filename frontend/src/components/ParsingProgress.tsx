'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

interface ParsingProgressProps {
  onComplete?: () => void;
}

export const ParsingProgress: React.FC<ParsingProgressProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Reading & Parsing Spreadsheets', desc: 'Absorbing messy headers, empty dashes, and date formats' },
    { title: 'Normalizing Staff Salaries & Timesheets', desc: 'Grouping 562 timesheet rows and 12-month salary grids' },
    { title: 'Computing Direct & Indirect Cost Rates', desc: 'Valuing support staff and absorbing non-billable hours' },
    { title: 'Running Zero-Overhead Reconciliation', desc: 'Verifying 2,400,000 AED salaries match project costs to the dirham' }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 500);
    const timer2 = setTimeout(() => setCurrentStep(2), 1100);
    const timer3 = setTimeout(() => setCurrentStep(3), 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100));

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFBFF]">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)] text-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#5932EA]/10 text-[#5932EA] flex items-center justify-center mb-5 relative">
          <Database className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Loader2 className="w-5 h-5 text-[#5932EA] animate-spin" />
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-[#111827] tracking-tight">
          Ingesting & Calculating Margin Analytics
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Processing agency spreadsheets and calculating cost rates...
        </p>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 mb-7">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-0.5">
            <span className="text-[#5932EA] font-semibold">Processing Pipeline</span>
            <span className="text-slate-800 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#5932EA] to-[#00B087] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Checklist */}
        <div className="space-y-3 text-left">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200/60 text-emerald-900'
                    : isCurrent
                    ? 'bg-[#5932EA]/5 border-[#5932EA]/20 text-[#111827] shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#5932EA] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>

                <div>
                  <h5 className="text-xs font-bold leading-tight">{step.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
