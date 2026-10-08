'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardMetrics, MonthlyTrend } from '../types/dashboard';
import { apiClient } from '../services/apiClient';

interface DataContextType {
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  availableYears: string[];
  availableMonths: string[];
  metrics: DashboardMetrics | null;
  monthlyTrends: MonthlyTrend[];
  hasData: boolean;
  isProcessing: boolean;
  isReconciled: boolean;
  isUploadOpen: boolean;
  setIsUploadOpen: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  isAuditOpen: boolean;
  setIsAuditOpen: (v: boolean) => void;
  handleLoadSample: () => Promise<void>;
  handleResetData: () => Promise<void>;
  handleUploadSuccess: () => Promise<void>;
  refetchGlobalMetrics: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYearState] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableYears, setAvailableYears] = useState<string[]>(['2025']);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const setSelectedYear = (newYear: string) => {
    setSelectedYearState(newYear);
    if (selectedMonth !== 'all' && newYear !== 'all' && !selectedMonth.startsWith(newYear)) {
      setSelectedMonth('all');
    }
  };

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const refetchGlobalMetrics = useCallback(async () => {
    try {
      const data = await apiClient.getDashboard(selectedYear, selectedMonth);
      setMetrics(data.metrics || null);
      setHasData(Boolean(data.hasData));
      if (data.availableYears && data.availableYears.length > 0) {
        setAvailableYears(data.availableYears);
      }
      if (data.availableMonths) {
        setAvailableMonths(data.availableMonths);
      }
      if (data.monthlyTrends) {
        setMonthlyTrends(data.monthlyTrends);
      }
    } catch (err) {
      console.error('Error fetching global metrics:', err);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    refetchGlobalMetrics();
  }, [refetchGlobalMetrics]);

  const handleLoadSample = async () => {
    setIsProcessing(true);
    try {
      await apiClient.loadSampleData();
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
      await apiClient.resetData();
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
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        availableYears,
        availableMonths,
        metrics,
        monthlyTrends,
        hasData,
        isProcessing,
        isReconciled,
        isUploadOpen,
        setIsUploadOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isAuditOpen,
        setIsAuditOpen,
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
