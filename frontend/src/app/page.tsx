'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { WelcomeHero } from '../components/WelcomeHero';
import { ParsingProgress } from '../components/ParsingProgress';
import { DashboardView } from '../components/DashboardView';
import { ProjectsView } from '../components/ProjectsView';
import { ProductivityView } from '../components/ProductivityView';
import { CategoriesView } from '../components/CategoriesView';
import { DepartmentsView } from '../components/DepartmentsView';
import { MatrixView } from '../components/MatrixView';
import { UploadModal } from '../components/UploadModal';
import { SettingsModal } from '../components/SettingsModal';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { AuditModal } from '../components/AuditModal';
import {
  DashboardMetrics,
  MonthlyTrend,
  ProjectMetric,
  ProductivityItem,
  CategoryItem,
  DepartmentItem
} from '../types/dashboard';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [projects, setProjects] = useState<ProjectMetric[]>([]);
  const [productivity, setProductivity] = useState<ProductivityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalCategoryHours, setTotalCategoryHours] = useState(0);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);

  // UI / Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMetric | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setFetchError(null);
    try {
      const dashRes = await fetch(`/api/dashboard?month=${selectedMonth}`);
      if (!dashRes.ok) throw new Error('Failed to fetch dashboard metrics');
      const dashData = await dashRes.json();
      setMetrics(dashData.metrics || null);
      setTrends(dashData.monthlyTrends || []);
      setHasData(Boolean(dashData.hasData));
      if (dashData.availableMonths) {
        setAvailableMonths(dashData.availableMonths);
      }

      const projRes = await fetch(`/api/projects?month=${selectedMonth}`);
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
      }

      const prodRes = await fetch(`/api/productivity?month=${selectedMonth}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductivity(prodData.productivity || []);
      }

      const catRes = await fetch(`/api/categories?month=${selectedMonth}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
        setTotalCategoryHours(catData.totalHours || 0);
      }

      const deptRes = await fetch(`/api/departments?month=${selectedMonth}`);
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFetchError(msg);
    } finally {
      setIsInitialLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle 1-click sample data loading with visual progress
  const handleLoadSample = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/sample-data', { method: 'POST' });
      await res.json();
      // Keep progress visible for ~2 seconds so user sees the ingestion steps
      await new Promise((resolve) => setTimeout(resolve, 2200));
      await fetchData();
    } catch (err) {
      console.error('Error loading sample data:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resetting data to test the fresh welcome state anytime
  const handleResetData = async () => {
    setIsInitialLoading(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Error resetting data:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    await fetchData();
    setIsProcessing(false);
  };

  const isReconciled = metrics?.reconciliationAudit?.isReconciled ?? true;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFBFF] text-[#111827] flex font-sans">
      {/* 1. Left SaaS Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLoadSample={handleLoadSample}
        isLoadingSample={isProcessing}
        isReconciled={isReconciled}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 sm:p-8 bg-[#FAFBFF]">
        {/* If files are being parsed and calculated, show visual progress */}
        {isProcessing ? (
          <ParsingProgress />
        ) : !hasData ? (
          /* Initial State: Empty Welcome Hero with the core question and 2 buttons */
          <WelcomeHero
            onLoadSample={handleLoadSample}
            onOpenUpload={() => setIsUploadOpen(true)}
            isLoading={isProcessing}
          />
        ) : (
          /* Data Loaded State: Full-Width SaaS Dashboard */
          <>
            {/* Top Header: Greeting & Period Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
                  Hello Leadership 👋,
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Financial Margin & Commercial Performance Dashboard
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Reset / Clear Button to test Welcome Screen */}
                <button
                  onClick={handleResetData}
                  title="Clear data to view welcome hero screen"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Reset Screen</span>
                </button>

                {/* Period Dropdown */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#5932EA]" />
                  <span className="text-slate-400 font-normal">Period:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-900 font-bold"
                  >
                    <option value="all">Full Year 2025</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audit Status Button */}
                <button
                  onClick={() => setIsAuditOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#008767] bg-[#16C098]/10 hover:bg-[#16C098]/20 border border-[#00B087]/20 rounded-xl transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008767]" />
                  <span>0.00 AED Audit</span>
                </button>
              </div>
            </div>

            {/* Top Metric Cards Row */}
            {metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 flex-shrink-0">
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#D3FFE7] text-[#00AC4F] flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Total Revenue</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#333333] tracking-tight mt-0.5">
                      AED {metrics.totalRevenue.toLocaleString()}
                    </h3>
                    <span className="text-[11px] text-[#00AC4F] font-bold flex items-center gap-0.5 mt-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      {metrics.projectCount} commercial projects
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#E7EDFF] text-[#5932EA] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Total Project Cost</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#333333] tracking-tight mt-0.5">
                      AED {metrics.totalCost.toLocaleString()}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                      Direct + Indirect Recovered
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#E5F9FF] text-[#00B087] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Gross Margin</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#00AC4F] tracking-tight mt-0.5">
                      {metrics.grossMarginPercent}%
                    </h3>
                    <span className="text-[11px] text-[#00AC4F] font-bold flex items-center gap-0.5 mt-0.5">
                      Profit: AED {metrics.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFF0EB] text-[#FF6A55] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-[#ACACAC] font-medium block">Billable Productivity</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#333333] tracking-tight mt-0.5">
                      {metrics.billableHoursPercent}%
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                      {metrics.billableHours.toLocaleString()} / {metrics.totalHours.toLocaleString()} hrs
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Full-Width Table View with Scrollable Rows */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {currentTab === 'dashboard' && (
                <DashboardView
                  projects={projects}
                  onSelectProject={(p) => setSelectedProject(p)}
                  selectedMonth={selectedMonth}
                />
              )}

              {currentTab === 'projects' && (
                <ProjectsView
                  projects={projects}
                  onSelectProject={(p) => setSelectedProject(p)}
                />
              )}

              {currentTab === 'productivity' && (
                <ProductivityView
                  items={productivity}
                  selectedMonth={selectedMonth}
                />
              )}

              {currentTab === 'categories' && (
                <CategoriesView
                  categories={categories}
                  totalHours={totalCategoryHours}
                  selectedMonth={selectedMonth}
                />
              )}

              {currentTab === 'departments' && (
                <DepartmentsView
                  departments={departments}
                  selectedMonth={selectedMonth}
                />
              )}

              {currentTab === 'matrix' && (
                <MatrixView selectedMonth={selectedMonth} />
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={fetchData}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </div>
  );
}
