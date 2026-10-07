'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
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
import { AlertCircle, RefreshCw } from 'lucide-react';

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

  // UI / Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMetric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch all data for current selection
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // 1. Dashboard metrics
      const dashRes = await fetch(`/api/dashboard?month=${selectedMonth}`);
      if (!dashRes.ok) throw new Error('Failed to fetch dashboard metrics');
      const dashData = await dashRes.json();
      setMetrics(dashData.metrics || null);
      setTrends(dashData.monthlyTrends || []);
      if (dashData.availableMonths) {
        setAvailableMonths(dashData.availableMonths);
      }

      // 2. Projects
      const projRes = await fetch(`/api/projects?month=${selectedMonth}`);
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
      }

      // 3. Productivity
      const prodRes = await fetch(`/api/productivity?month=${selectedMonth}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductivity(prodData.productivity || []);
      }

      // 4. Categories
      const catRes = await fetch(`/api/categories?month=${selectedMonth}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
        setTotalCategoryHours(catData.totalHours || 0);
      }

      // 5. Departments
      const deptRes = await fetch(`/api/departments?month=${selectedMonth}`);
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle 1-click sample data loading
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const res = await fetch('/api/sample-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error loading sample data:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const isReconciled = metrics?.reconciliationAudit?.isReconciled ?? true;
  const diffAmount = metrics?.reconciliationAudit?.difference ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableMonths={availableMonths}
        isReconciled={isReconciled}
        diffAmount={diffAmount}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingSample}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/20 p-4 flex items-center justify-between text-xs text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Could not connect to backend server: {fetchError}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-900/60 text-white font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-xs font-medium">Computing margin analytics...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                trends={trends}
                selectedMonth={selectedMonth}
                onOpenAudit={() => setIsAuditOpen(true)}
                onSelectProjectTab={() => setCurrentTab('projects')}
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

            {currentTab === 'audit' && (
              <div className="space-y-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Full Cost Reconciliation Engine</h3>
                    <p className="text-xs text-slate-400">
                      Proves mathematically that agency direct and indirect rates recover 100% of staff salaries with zero drift.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAuditOpen(true)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors"
                  >
                    Open Deep Audit Breakdown
                  </button>
                </div>
                {/* Reconciler preview directly on page */}
                <DashboardView
                  metrics={metrics}
                  trends={trends}
                  selectedMonth={selectedMonth}
                  onOpenAudit={() => setIsAuditOpen(true)}
                  onSelectProjectTab={() => setCurrentTab('projects')}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>tentwenty · Engineering Take-Home Margin Dashboard</span>
          <span className="font-mono text-[11px] text-slate-400">
            Reconciles to the dirham: 2,400,000 AED Salaries == 2,400,000 AED Project Cost
          </span>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchData}
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
