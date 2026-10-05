/**
 * LeadNoria — Phase 15: UI/UX Integration
 * Accessible Status Badge Component
 * 
 * Strict Invariants:
 * - Always pairs color with distinct icon and explicit textual status
 * - Never relies on color alone (WCAG 2.1 AA)
 */

import React from 'react';
import { getSemanticStatusBadge } from '../designSystem.ts';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  customLabel,
  className = ''
}) => {
  const { colorClass, iconSymbol, accessibleLabel } = getSemanticStatusBadge(status);
  const text = customLabel || status.replace(/_/g, ' ');

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-0.5 text-xs';

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1 font-semibold rounded border uppercase tracking-wider ${colorClass} ${sizeClasses} ${className}`}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <span aria-hidden="true" className="font-bold">{iconSymbol}</span>
      <span>{text}</span>
    </span>
  );
};
