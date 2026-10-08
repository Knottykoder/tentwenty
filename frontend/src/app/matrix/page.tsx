'use client';

import React from 'react';
import { MatrixView } from '../../components/MatrixView';
import { useData } from '../../context/DataContext';

export default function MatrixPage() {
  const { selectedYear, selectedMonth } = useData();

  return <MatrixView selectedYear={selectedYear} selectedMonth={selectedMonth} />;
}
