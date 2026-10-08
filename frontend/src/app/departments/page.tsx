'use client';

import React from 'react';
import { DepartmentsView } from '../../components/DepartmentsView';
import { useData } from '../../context/DataContext';
import { useApiData } from '../../hooks/useApiData';
import { apiClient } from '../../services/apiClient';
import { LoadingState } from '../../components/common/LoadingState';

export default function DepartmentsPage() {
  const { selectedYear, selectedMonth } = useData();
  const { data, loading } = useApiData(
    () => apiClient.getDepartments(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  if (loading || !data) {
    return <LoadingState message="Loading department drill-down..." />;
  }

  return (
    <DepartmentsView
      departments={data.departments || []}
      selectedMonth={selectedMonth}
    />
  );
}
