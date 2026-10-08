'use client';

import React, { useState } from 'react';
import { WelcomeHero } from '../components/WelcomeHero';
import { RevenueCostLineChart } from '../components/RevenueCostLineChart';
import { DepartmentDonutChart } from '../components/DepartmentDonutChart';
import { CategoryBarChart } from '../components/CategoryBarChart';
import { LoadingState } from '../components/common/LoadingState';
import { useData } from '../context/DataContext';
import { useApiData } from '../hooks/useApiData';
import { apiClient } from '../services/apiClient';

export default function DashboardPage() {
  const {
    selectedYear,
    selectedMonth,
    setSelectedMonth,
    monthlyTrends,
    hasData,
    handleLoadSample,
    setIsUploadOpen,
    isProcessing
  } = useData();

  const [metricMode, setMetricMode] = useState<'cost' | 'hours'>('cost');
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const { data, loading } = useApiData(
    () =>
      Promise.all([
        apiClient.getDepartments(selectedYear, selectedMonth),
        apiClient.getCategories(selectedYear, selectedMonth)
      ]).then(([deptRes, catRes]) => ({
        departments: deptRes.departments || [],
        categories: catRes.categories || []
      })),
    [selectedYear, selectedMonth]
  );

  // Filter trends by selectedYear if not 'all'
  const filteredTrends = selectedYear === 'all'
    ? monthlyTrends
    : monthlyTrends.filter((t) => t.month.startsWith(selectedYear));

  if (!hasData) {
    return (
      <WelcomeHero
        onLoadSample={handleLoadSample}
        onOpenUpload={() => setIsUploadOpen(true)}
        isLoading={isProcessing}
      />
    );
  }

  if (loading || !data) {
    return <LoadingState message="Loading dashboard visualizations..." />;
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
            departments={data.departments}
            activeDept={activeDept}
            onSelectDept={(d) => setActiveDept(activeDept === d ? null : d)}
            metricMode={metricMode}
            setMetricMode={setMetricMode}
          />
        </div>

        {/* Right: Category Hours Breakdown Horizontal Bar Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <CategoryBarChart categories={data.categories} />
        </div>
      </div>
    </div>
  );
}
