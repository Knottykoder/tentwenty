'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  PieChart,
  Building2,
  Table,
  ChevronRight,
  ShieldCheck,
  Hexagon,
  RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    isReconciled,
    setIsUploadOpen,
    setIsSettingsOpen,
    handleLoadSample,
    isProcessing
  } = useData();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: Briefcase },
    { href: '/productivity', label: 'Productivity', icon: Users },
    { href: '/categories', label: 'Categories', icon: PieChart },
    { href: '/departments', label: 'Departments', icon: Building2 },
    { href: '/matrix', label: 'Pivot Matrix', icon: Table }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 flex-shrink-0 select-none h-full shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-9 px-2">
          <div className="w-9 h-9 rounded-xl bg-[#5932EA]/10 text-[#5932EA] flex items-center justify-center font-black">
            <Hexagon className="w-6 h-6 fill-[#5932EA]/20" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#111827] tracking-tight flex items-center gap-1.5">
              Dashboard
              <span className="text-[10px] text-slate-400 font-semibold">v.01</span>
            </h1>
          </div>
        </div>

        {/* Real Navigation Links using next/link */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#5932EA] text-white shadow-md shadow-[#5932EA]/25'
                    : 'text-[#9197B3] hover:text-[#5932EA] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#9197B3]'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-white translate-x-0.5' : 'text-[#9197B3]'
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        {/* Audit Status Box */}
        <div className="bg-gradient-to-br from-[#5932EA]/10 via-[#5932EA]/5 to-transparent border border-[#5932EA]/15 rounded-2xl p-4 text-center">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#5932EA] text-white flex items-center justify-center mb-2 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[#111827]">Audit Status</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isReconciled ? '0.00 AED Reconciliation' : 'Variance Detected'}
          </p>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors shadow-sm cursor-pointer"
            >
              Upload
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors shadow-sm cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              EA
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#111827]">Leadership</h5>
              <p className="text-[10px] text-slate-400 font-medium">Agency Director</p>
            </div>
          </div>
          <button
            onClick={handleLoadSample}
            disabled={isProcessing}
            title="Reload 2025 Data"
            className="p-1.5 text-slate-400 hover:text-[#5932EA] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </aside>
  );
};
