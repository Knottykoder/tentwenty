'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [timesheetFile, setTimesheetFile] = useState<File | null>(null);
  const [salariesFile, setSalariesFile] = useState<File | null>(null);
  const [pricesFile, setPricesFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timesheetFile && !salariesFile && !pricesFile) {
      setStatusMessage({ type: 'error', text: 'Please select at least one .xlsx spreadsheet to upload.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    if (timesheetFile) formData.append('timesheet', timesheetFile);
    if (salariesFile) formData.append('salaries', salariesFile);
    if (pricesFile) formData.append('prices', pricesFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Files uploaded and processed successfully!'
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || (data.errors ? data.errors.join(', ') : 'Upload failed.')
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({ type: 'error', text: 'Network error during upload: ' + msg });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              Upload Spreadsheets
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supports real-world messy headers and dates. Re-uploading a month updates records without wiping others.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          {/* Timesheet */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                1. Timesheet Spreadsheet (.xlsx)
              </label>
              <span className="text-[11px] text-slate-400">One row per person, task, month</span>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setTimesheetFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          {/* Salary Overview */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                2. Salary Overview (.xlsx)
              </label>
              <span className="text-[11px] text-slate-400">Employee rows, month columns</span>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setSalariesFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          {/* Project Prices */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                3. Project Prices (.xlsx)
              </label>
              <span className="text-[11px] text-slate-400">Ref Code, price, sales month</span>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setPricesFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          {statusMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload & Ingest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
