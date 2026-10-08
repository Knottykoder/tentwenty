'use client';

import React, { useState, useEffect } from 'react';
import { RevenueCostLineChart } from '../components/RevenueCostLineChart';
import { DepartmentDonutChart } from '../components/DepartmentDonutChart';
import { CategoryBarChart } from '../components/CategoryBarChart';
import { DepartmentItem, CategoryItem } from '../types/dashboard';
import { useData } from '../context/DataContext';
import { RefreshCw, ArrowRight, FolderKanban } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    selectedYear,
    selectedMonth,
    setSelectedMonth,
    monthlyTrends
  } = useData();

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [metricMode, setMetricMode] = useState<'cost' | 'hours'>('cost');
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/departments?year=${selectedYear}&month=${selectedMonth}`).then((r) => r.json()),
      fetch(`/api/categories?year=${selectedYear}&month=${selectedMonth}`).then((r) => r.json())
    ])
      .then(([deptData, catData]) => {
        if (isMounted) {
          setDepartments(deptData.departments || []);
          setCategories(catData.categories || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedMonth]);

  // Filter trends by selectedYear if not 'all'
  const filteredTrends = selectedYear === 'all'
    ? monthlyTrends
    : monthlyTrends.filter((t) => t.month.startsWith(selectedYear));

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-[#5932EA] mb-2" />
        <p className="text-xs font-semibold text-slate-400">Loading dashboard visualizations...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-4 pr-1">
      {/* 1. 12-Month Financial Trajectory Line Chart */}
      <RevenueCostLineChart
        trends={filteredTrends}
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => {
          setSelectedMonth(selectedMonth === m ? 'all' : m);
        }}
      />

      {/* 2. Secondary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Department Allocation Doughnut Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <DepartmentDonutChart
            departments={departments}
            activeDept={activeDept}
            onSelectDept={(d) => setActiveDept(activeDept === d ? null : d)}
            metricMode={metricMode}
            setMetricMode={setMetricMode}
          />
        </div>

        {/* Right: Category Distribution & Quick Links (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex-1 min-h-[220px]">
            <CategoryBarChart categories={categories} />
          </div>

          {/* Quick Route Card to Commercial Projects */}
          <div className="bg-gradient-to-br from-[#5932EA]/5 via-white to-white rounded-2xl border border-[#5932EA]/20 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5932EA] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Looking for individual project economics?
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Browse all active accounts, margins, and employee contribution tables.
                </p>
              </div>
            </div>

            <Link
              href="/projects"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#5932EA] hover:bg-[#4825cc] rounded-xl transition-all shadow-sm flex-shrink-0"
            >
              <span>View Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
