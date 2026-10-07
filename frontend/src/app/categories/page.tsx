'use client';

import React, { useState, useEffect } from 'react';
import { CategoriesView } from '../../components/CategoriesView';
import { CategoryItem } from '../../types/dashboard';
import { useData } from '../../context/DataContext';
import { RefreshCw } from 'lucide-react';

export default function CategoriesPage() {
  const { selectedMonth } = useData();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/categories?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setCategories(data.categories || []);
          setTotalHours(data.totalHours || 0);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-[#5932EA] mb-2" />
        <p className="text-xs font-semibold text-slate-400">Loading category breakdown...</p>
      </div>
    );
  }

  return (
    <CategoriesView
      categories={categories}
      totalHours={totalHours}
      selectedMonth={selectedMonth}
    />
  );
}
