import React from 'react';
import { getPriorityStyle } from '../../utils/formatters';
import { Flame, AlertCircle, ArrowDown } from 'lucide-react';

export const PriorityBadge = ({ priority, showIcon = true, className = '' }) => {
  const style = getPriorityStyle(priority);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs border ${style.badge} ${className}`}
    >
      {showIcon && priority === 'High' && <Flame className="w-3.5 h-3.5 text-rose-600" />}
      {showIcon && priority === 'Medium' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
      {showIcon && priority === 'Low' && <ArrowDown className="w-3 h-3 text-slate-500" />}
      <span>{priority || 'Medium'}</span>
    </span>
  );
};
