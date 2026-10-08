'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = 'flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm p-8'
}) => {
  return (
    <div className={className}>
      <RefreshCw className="w-8 h-8 animate-spin text-[#5932EA] mb-2" />
      <p className="text-xs font-semibold text-slate-400">{message}</p>
    </div>
  );
};
