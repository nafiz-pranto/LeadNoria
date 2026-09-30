/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Checkpoint Recovery Banner Component
 * 
 * Strict Invariants:
 * - Detects resumable runs using real checkpoint metadata
 * - Avoids restarting already completed stages
 * - Discard requires explicit user action
 */

import React from 'react';
import { CheckpointRecoveryViewModel } from '../types.ts';

interface RecoveryBannerProps {
  recoveryInfo: CheckpointRecoveryViewModel;
  onResume: () => void;
  onDiscard: () => void;
}

export const RecoveryBanner: React.FC<RecoveryBannerProps> = ({
  recoveryInfo,
  onResume,
  onDiscard
}) => {
  return (
    <div
      className="p-3 bg-sky-950/50 border border-sky-500/40 rounded-lg flex items-start justify-between gap-3 text-xs text-sky-200"
      role="region"
      aria-label="Resumable run notification"
    >
      <div className="flex items-start gap-2">
        <span className="text-base text-sky-400 leading-none mt-0.5" aria-hidden="true">⏱</span>
        <div>
          <strong className="font-semibold block text-slate-100">
            Resumable Run Detected ({recoveryInfo.runId})
          </strong>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Source: <strong className="text-slate-100">{recoveryInfo.sourceType}</strong> • Last stage: <code className="px-1 py-0.2 bg-slate-900 rounded font-mono text-[10px]">{recoveryInfo.lastCompletedStage}</code> • {recoveryInfo.savedCandidateCount} candidates saved.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onResume}
          className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          Resume Run
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors focus:outline-none"
        >
          Discard
        </button>
      </div>
    </div>
  );
};
