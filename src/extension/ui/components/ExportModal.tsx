/**
 * LeadNoria — Phase 15 & Phase 25: UI/UX Integration & Unified Lead Intelligence
 * Export Modal with Policy Firewall Breakdown
 * 
 * Strict Invariants:
 * - Selected records != exportable records
 * - Separates eligible records from restricted records
 * - Policy firewall prevents laundering or bypassing restrictions
 * - Displays clear eligibility breakdown: "You selected X records. Y are unavailable... Z are eligible."
 * - Accessible modal: Escape to close, focus management, disabled submission guard
 */

import React, { useEffect, useRef } from 'react';
import { ExportPreviewViewModel } from '../types.ts';

interface ExportModalProps {
  isOpen: boolean;
  preview: ExportPreviewViewModel;
  onConfirmExport: () => void;
  onCancel: () => void;
  isExporting?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  preview,
  onConfirmExport,
  onCancel,
  isExporting = false
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);
    confirmBtnRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <h2 id="export-modal-title" className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>⭳</span> Export Research Data
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Close export dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 text-xs text-slate-300">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Data export complies strictly with the LeadNoria source policy firewall. Records with restricted consumer-web provenance are protected and excluded.
          </p>

          {/* Counts Overview */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Selected Records</span>
              <span className="text-base font-bold text-slate-200">{preview.totalSelectedRecords}</span>
            </div>
            <div className="p-2.5 bg-emerald-950/30 rounded border border-emerald-500/30">
              <span className="text-[10px] uppercase text-emerald-400 block mb-0.5">Eligible for Export</span>
              <span className="text-base font-bold text-emerald-300">{preview.exportableRecordsCount}</span>
            </div>
          </div>

          {/* Eligibility Breakdown Summary */}
          {preview.restrictedRecordsCount > 0 ? (
            <div className="p-2.5 bg-purple-950/40 border border-purple-500/40 rounded text-[11px] text-purple-200">
              <span className="font-semibold text-purple-300 block mb-0.5">⊘ Partial Export Eligibility:</span>
              You selected {preview.totalSelectedRecords} records. {preview.restrictedRecordsCount} are unavailable for export due to source restrictions. {preview.exportableRecordsCount} are eligible.
            </div>
          ) : (
            <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded text-[11px] text-emerald-300">
              ✓ All {preview.totalSelectedRecords} selected records satisfy export policy requirements.
            </div>
          )}

          {/* Eligible Fields */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Included Export Fields:
            </span>
            <div className="flex flex-wrap gap-1">
              {preview.eligibleFields.map(f => (
                <span key={f} className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Restricted Fields Omitted */}
          {preview.restrictedFieldsOmitted.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                Restricted Fields Protected:
              </span>
              <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-0.5">
                {preview.restrictedFieldsOmitted.map((rf, i) => (
                  <li key={i}>{rf}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors focus:outline-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={!preview.isExportReady || isExporting}
            onClick={onConfirmExport}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer ${
              preview.isExportReady && !isExporting
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            {isExporting ? (
              <span>Exporting CSV...</span>
            ) : (
              <span>Download CSV ({preview.exportableRecordsCount})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
