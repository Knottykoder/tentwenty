'use client';

import React, { useState, useEffect } from 'react';
import { DashboardView } from '../components/DashboardView';
import { RevenueCostLineChart } from '../components/RevenueCostLineChart';
import { ProjectMetric } from '../types/dashboard';
import { useData } from '../context/DataContext';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const {
    selectedYear,
    selectedMonth,
    setSelectedMonth,
    setSelectedProject,
    monthlyTrends
  } = useData();
  const [projects, setProjects] = useState<ProjectMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/projects?year=${selectedYear}&month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setProjects(data.projects || []);
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
        <p className="text-xs font-semibold text-slate-400">Loading dashboard records...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* 12-Month Revenue vs Cost Trajectory Line Chart */}
      <RevenueCostLineChart
        trends={filteredTrends}
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => {
          setSelectedMonth(selectedMonth === m ? 'all' : m);
        }}
      />

      {/* Projects Table */}
      <DashboardView
        projects={projects}
        onSelectProject={(p) => setSelectedProject(p)}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
