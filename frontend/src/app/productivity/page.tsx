'use client';

import React, { useState, useEffect } from 'react';
import { ProductivityView } from '../../components/ProductivityView';
import { ProductivityItem } from '../../types/dashboard';
import { useData } from '../../context/DataContext';
import { RefreshCw } from 'lucide-react';

export default function ProductivityPage() {
  const { selectedMonth } = useData();
  const [productivity, setProductivity] = useState<ProductivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/productivity?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setProductivity(data.productivity || []);
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
        <p className="text-xs font-semibold text-slate-400">Loading productivity records...</p>
      </div>
    );
  }

  return (
    <ProductivityView
      items={productivity}
      selectedMonth={selectedMonth}
    />
  );
}
