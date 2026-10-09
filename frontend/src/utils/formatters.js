/**
 * Formats ISO date string to human readable format (e.g., "Aug 24, 2026, 09:30 PM")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Formats date to short date (e.g. "Aug 24, 2026")
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Returns color classes for complaint status
 */
export const getStatusStyle = (status) => {
  switch (status) {
    case 'Open':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        dot: 'bg-blue-500'
      };
    case 'In Progress':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500 animate-pulse'
      };
    case 'Resolved':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-500'
      };
  }
};

/**
 * Returns color classes for complaint priority
 */
export const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'High':
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-200 font-semibold dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    case 'Medium':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200 font-medium dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    case 'Low':
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200 font-medium dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        iconColor: 'text-slate-500'
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        iconColor: 'text-slate-500'
      };
  }
};

export const COMPLAINT_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Security',
  'Lift/Elevator',
  'Water Supply',
  'Parking',
  'Common Area',
  'Other'
];
