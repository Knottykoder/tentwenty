'use client';

import React from 'react';
import { MatrixView } from '../../components/MatrixView';
import { useData } from '../../context/DataContext';
import { useApiData } from '../../hooks/useApiData';
import { apiClient } from '../../services/apiClient';
import { LoadingState } from '../../components/common/LoadingState';

export default function MatrixPage() {
  const { selectedYear, selectedMonth } = useData();
  const { data, loading } = useApiData(
    () => apiClient.getMatrix(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  if (loading || !data) {
    return <LoadingState message="Loading pivot matrix..." />;
  }

  return <MatrixView data={data} selectedMonth={selectedMonth} />;
}
