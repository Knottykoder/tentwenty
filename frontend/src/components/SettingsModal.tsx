'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, DollarSign, Tag, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [overhead, setOverhead] = useState<number>(0);
  const [billableCategories, setBillableCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.config) {
            setOverhead(data.config.monthlyOverhead || 0);
            setBillableCategories(data.config.billableCategories || ['Projects', 'Enhancements', 'Hosting']);
          }
          if (data.availableCategories) {
            setAvailableCategories(data.availableCategories);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (cat: string) => {
    if (billableCategories.includes(cat)) {
      setBillableCategories(billableCategories.filter((c) => c !== cat));
    } else {
      setBillableCategories([...billableCategories, cat]);
    }
  };

  const handleResetDefaults = () => {
    setOverhead(0);
    setBillableCategories(['Projects', 'Enhancements', 'Hosting']);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyOverhead: Number(overhead) || 0,
          billableCategories
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => {
          onSave();
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Configurable Assumptions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure overhead and billable scope live without code changes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Monthly Overhead Input */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Monthly Agency Overhead (AED)
              </span>
              <span className="text-[11px] font-normal text-slate-500">Default: 0 AED</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Office rent and fixed licenses added to the indirect pool each month.
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">AED</span>
              <input
                type="number"
                min="0"
                step="500"
                value={overhead}
                onChange={(e) => setOverhead(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-2 text-sm text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Billable Categories Selection */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-600" />
                Billable Categories
              </label>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Checked categories are billed to projects. Unchecked categories are absorbed.
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {(availableCategories.length > 0
                ? availableCategories
                : ['Projects', 'Enhancements', 'Hosting', 'FC - Meetings', 'FC - Leaves', 'FC - Learning', 'FC - Bug Fixes']
              ).map((cat) => {
                const isChecked = billableCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCategory(cat)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0"
                    />
                    <span className="truncate">{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Assumptions updated and recalculated!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#141517] hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Apply & Recalculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
