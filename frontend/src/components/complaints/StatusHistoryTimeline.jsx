import React from 'react';
import { formatDate, getStatusStyle } from '../../utils/formatters';
import { Clock, User, CheckCircle, ArrowRight, FileText, AlertCircle } from 'lucide-react';

export const StatusHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
        <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium">No status history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
      {history.map((entry, index) => {
        const isLatest = index === history.length - 1;
        const statusStyle = getStatusStyle(entry.new_status);

        return (
          <div key={entry.id || index} className="relative group">
            {/* Timeline bullet dot */}
            <div
              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm ${
                isLatest ? 'bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950' : 'bg-slate-400'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Timeline item card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {entry.previous_status ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className="text-slate-500 line-through">{entry.previous_status}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`px-2 py-0.5 rounded-full ${statusStyle.bg}`}>
                        {entry.new_status}
                      </span>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg}`}>
                      {entry.new_status} (Initial)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(entry.created_at)}</span>
                </div>
              </div>

              {/* Actor attribution */}
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated by: <strong className="text-slate-800 dark:text-slate-200">{entry.actor_name || 'System / Resident'}</strong></span>
                {entry.actor_role && (
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold ${
                    entry.actor_role === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {entry.actor_role}
                  </span>
                )}
              </div>

              {/* Note / Remarks */}
              {entry.note && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <p className="leading-relaxed whitespace-pre-wrap">{entry.note}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
