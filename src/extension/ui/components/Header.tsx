/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Extension Global Header & Navigation Tabs
 * 
 * Invariants:
 * - Product: LeadNoria
 * - Tagline: "Discover. Verify. Connect."
 * - Descriptor: "Business lead research from real public signals."
 * - 5 Primary Tabs: Research, Run Status, Results, History, Settings
 */

import React from 'react';
import { NavigationTab } from '../types.ts';

interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  resultsCount?: number;
  isRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  resultsCount = 0,
  isRunning = false
}) => {
  const tabs: Array<{ id: NavigationTab; label: string; badge?: string | number }> = [
    { id: 'RESEARCH', label: 'Research' },
    { id: 'RUN_STATUS', label: 'Run Status', badge: isRunning ? 'LIVE' : undefined },
    { id: 'RESULTS', label: 'Results', badge: resultsCount > 0 ? resultsCount : undefined },
    { id: 'HISTORY', label: 'History' },
    { id: 'SETTINGS', label: 'Settings' }
  ];

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 shrink-0">
      {/* Brand & Descriptor Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            LN
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5 leading-none">
              LeadNoria
              <span className="text-[10px] font-normal text-slate-500">• Discover. Verify. Connect.</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
              Business lead research from real public signals.
            </p>
          </div>
        </div>

        {isRunning && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/40 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            RUNNING
          </span>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center px-2 gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label="LeadNoria navigation tabs">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                isActive
                  ? 'border-sky-500 text-sky-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge != null && (
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                  tab.badge === 'LIVE'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
