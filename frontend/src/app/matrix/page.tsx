'use client';

import React from 'react';
import { MatrixView } from '../../components/MatrixView';
import { useData } from '../../context/DataContext';

export default function MatrixPage() {
  const { selectedMonth } = useData();

  return <MatrixView selectedMonth={selectedMonth} />;
}
