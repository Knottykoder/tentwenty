'use client';

import React from 'react';
import { ProjectsView } from '../../components/ProjectsView';
import { useData } from '../../context/DataContext';
import { useApiData } from '../../hooks/useApiData';
import { apiClient } from '../../services/apiClient';
import { LoadingState } from '../../components/common/LoadingState';

export default function ProjectsPage() {
  const { selectedYear, selectedMonth } = useData();
  const { data, loading } = useApiData(
    () => apiClient.getProjects(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  if (loading || !data) {
    return <LoadingState message="Loading projects breakdown..." />;
  }

  return <ProjectsView projects={data.projects || []} />;
}
