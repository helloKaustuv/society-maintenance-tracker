import React from 'react';
import { getStatusStyle } from '../../utils/formatters';

export const StatusBadge = ({ status, className = '' }) => {
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${style.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status || 'Unknown'}
    </span>
  );
};
