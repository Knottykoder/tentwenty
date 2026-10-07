'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, DollarSign, Tag, RotateCcw } from 'lucide-react';
import { AppConfig } from '../types/dashboard';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Configurable Assumptions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adjust overhead and billable scope dynamically without touching code.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Monthly Overhead Input */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Monthly Agency Overhead (AED)
              </span>
              <span className="text-[11px] text-slate-400">Default: 0 AED for Reconciliation</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Office rent, software licenses, utilities added to the indirect cost pool each month.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">AED</span>
              <input
                type="number"
                min="0"
                step="500"
                value={overhead}
                onChange={(e) => setOverhead(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-2 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Billable Categories Selection */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                Billable Categories
              </label>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Checked categories are billed directly to clients. Unchecked categories are absorbed into the indirect cost pool.
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
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCategory(cat)}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                    />
                    <span className="truncate">{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Assumptions updated! Calculations refreshed.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Apply & Recalculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
