'use client';

import React from 'react';
import { ProductivityView } from '../../components/ProductivityView';
import { useData } from '../../context/DataContext';
import { useApiData } from '../../hooks/useApiData';
import { apiClient } from '../../services/apiClient';
import { LoadingState } from '../../components/common/LoadingState';

export default function ProductivityPage() {
  const { selectedYear, selectedMonth } = useData();
  const { data, loading } = useApiData(
    () => apiClient.getProductivity(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  if (loading || !data) {
    return <LoadingState message="Loading productivity records..." />;
  }

  return (
    <ProductivityView
      items={data.productivity || []}
      selectedMonth={selectedMonth}
    />
  );
}
