import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const OverdueTag = ({ daysOpen, thresholdDays = 3, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm animate-pulse-subtle border border-rose-600 ${className}`}
      title={`Complaint has remained unresolved for ${daysOpen || thresholdDays}+ days (Overdue threshold: ${thresholdDays} days)`}
    >
      <AlertTriangle className="w-3 h-3 text-rose-100 shrink-0" />
      <span>OVERDUE {daysOpen ? `(${daysOpen}d)` : ''}</span>
    </span>
  );
};
