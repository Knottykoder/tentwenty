'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardMetrics, ProjectMetric } from '../types/dashboard';

interface DataContextType {
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  availableMonths: string[];
  metrics: DashboardMetrics | null;
  hasData: boolean;
  isProcessing: boolean;
  isReconciled: boolean;
  isUploadOpen: boolean;
  setIsUploadOpen: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  isAuditOpen: boolean;
  setIsAuditOpen: (v: boolean) => void;
  selectedProject: ProjectMetric | null;
  setSelectedProject: (p: ProjectMetric | null) => void;
  handleLoadSample: () => Promise<void>;
  handleResetData: () => Promise<void>;
  handleUploadSuccess: () => Promise<void>;
  refetchGlobalMetrics: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMetric | null>(null);

  const refetchGlobalMetrics = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?month=${selectedMonth}`);
      if (!res.ok) return;
      const data = await res.json();
      setMetrics(data.metrics || null);
      setHasData(Boolean(data.hasData));
      if (data.availableMonths) {
        setAvailableMonths(data.availableMonths);
      }
    } catch (err) {
      console.error('Error fetching global metrics:', err);
    }
  }, [selectedMonth]);

  useEffect(() => {
    refetchGlobalMetrics();
  }, [refetchGlobalMetrics]);

  const handleLoadSample = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/sample-data', { method: 'POST' });
      // Keep animated progress visible for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await refetchGlobalMetrics();
    } catch (err) {
      console.error('Error loading sample data:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetData = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      await refetchGlobalMetrics();
    } catch (err) {
      console.error('Error resetting data:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSuccess = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await refetchGlobalMetrics();
    setIsProcessing(false);
  };

  const isReconciled = metrics?.reconciliationAudit?.isReconciled ?? true;

  return (
    <DataContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        metrics,
        hasData,
        isProcessing,
        isReconciled,
        isUploadOpen,
        setIsUploadOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isAuditOpen,
        setIsAuditOpen,
        selectedProject,
        setSelectedProject,
        handleLoadSample,
        handleResetData,
        handleUploadSuccess,
        refetchGlobalMetrics
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
