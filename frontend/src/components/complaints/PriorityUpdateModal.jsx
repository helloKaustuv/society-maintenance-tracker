import React, { useState } from 'react';
import { X, Flame, AlertCircle, ArrowDown } from 'lucide-react';
import { getPriorityStyle } from '../../utils/formatters';

export const PriorityUpdateModal = ({
  isOpen,
  complaint,
  onClose,
  onUpdatePriority,
  loading = false
}) => {
  const [selectedPriority, setSelectedPriority] = useState(complaint?.priority || 'Medium');

  if (!isOpen || !complaint) return null;

  const priorities = [
    { level: 'Low', icon: ArrowDown, desc: 'Minor cosmetic or non-blocking request' },
    { level: 'Medium', icon: AlertCircle, desc: 'Standard maintenance priority' },
    { level: 'High', icon: Flame, desc: 'Urgent hazard, water leak or safety issue' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdatePriority(complaint.id, { priority: selectedPriority });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Set Complaint Priority
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complaint #{complaint.id} • {complaint.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2.5">
            {priorities.map(({ level, icon: Icon, desc }) => {
              const isSelected = selectedPriority === level;
              const style = getPriorityStyle(level);

              return (
                <div
                  key={level}
                  onClick={() => setSelectedPriority(level)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${style.badge} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{level} Priority</h4>
                      <input
                        type="radio"
                        name="priority"
                        checked={isSelected}
                        onChange={() => setSelectedPriority(level)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Priority'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
