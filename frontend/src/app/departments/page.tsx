'use client';

import React, { useState, useEffect } from 'react';
import { DepartmentsView } from '../../components/DepartmentsView';
import { DepartmentItem } from '../../types/dashboard';
import { useData } from '../../context/DataContext';
import { RefreshCw } from 'lucide-react';

export default function DepartmentsPage() {
  const { selectedYear, selectedMonth } = useData();
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/departments?year=${selectedYear}&month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setDepartments(data.departments || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-[#5932EA] mb-2" />
        <p className="text-xs font-semibold text-slate-400">Loading department drill-down...</p>
      </div>
    );
  }

  return (
    <DepartmentsView
      departments={departments}
      selectedMonth={selectedMonth}
    />
  );
}
