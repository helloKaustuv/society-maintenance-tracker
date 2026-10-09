import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getStatusStyle } from '../../utils/formatters';

export const StatusUpdateModal = ({
  isOpen,
  complaint,
  onClose,
  onUpdateStatus,
  loading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || 'Open');
  const [note, setNote] = useState('');

  if (!isOpen || !complaint) return null;

  const statuses = ['Open', 'In Progress', 'Resolved'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(complaint.id, {
      status: selectedStatus,
      note: note.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Update Complaint Status
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Status Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Select New Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statuses.map((status) => {
                const isSelected = selectedStatus === status;
                const style = getStatusStyle(status);

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mb-1.5 ${style.dot}`} />
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Note / Explanation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Status Change Note / Technician Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Technician assigned, spare parts ordered, issue inspected and fixed..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              💡 This note will be recorded in the complaint audit history and emailed to the resident.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              {loading ? 'Saving...' : 'Update & Notify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
