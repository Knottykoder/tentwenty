'use client';

import React from 'react';
import { CategoriesView } from '../../components/CategoriesView';
import { useData } from '../../context/DataContext';
import { useApiData } from '../../hooks/useApiData';
import { apiClient } from '../../services/apiClient';
import { LoadingState } from '../../components/common/LoadingState';

export default function CategoriesPage() {
  const { selectedYear, selectedMonth } = useData();
  const { data, loading } = useApiData(
    () => apiClient.getCategories(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  if (loading || !data) {
    return <LoadingState message="Loading category breakdown..." />;
  }

  return (
    <CategoriesView
      categories={data.categories || []}
      totalHours={data.totalHours || 0}
      selectedMonth={selectedMonth}
    />
  );
}
