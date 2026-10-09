import React, { useState, useEffect } from 'react';
import { noticeService } from '../../services/noticeService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import {
  Megaphone,
  PlusCircle,
  Pin,
  AlertTriangle,
  Calendar,
  Edit2,
  Trash2,
  X,
  User,
  Save,
  Radio
} from 'lucide-react';

export const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    is_important: false
  });

  // Edit Modal State
  const [editingNotice, setEditingNotice] = useState(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  const { success, error } = useToast();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeService.getAllNotices();
      setNotices(res.data?.notices || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
      error('Failed to fetch society notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      error('Please provide both notice title and description.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await noticeService.createNoticeAdmin(newNotice);
      success(res.message || 'Notice published successfully!');
      setNewNotice({ title: '', content: '', is_important: false });
      setIsCreating(false);
      fetchNotices();
    } catch (err) {
      error(err.message || 'Failed to publish notice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingNotice) return;

    try {
      setActionLoading(true);
      const res = await noticeService.updateNoticeAdmin(editingNotice.id, {
        title: editingNotice.title,
        content: editingNotice.content,
        is_important: editingNotice.is_important
      });
      success('Notice updated successfully!');
      setEditingNotice(null);
      fetchNotices();
    } catch (err) {
      error(err.message || 'Failed to update notice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      setActionLoading(true);
      await noticeService.deleteNoticeAdmin(deletingId);
      success('Notice deleted successfully.');
      setDeletingId(null);
      fetchNotices();
    } catch (err) {
      error(err.message || 'Failed to delete notice.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Society Notice Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish announcements, pin important circulars, and broadcast email notifications to all residents.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          {isCreating ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {isCreating ? 'Close Form' : 'Publish New Notice'}
        </button>
      </div>

      {/* Notice Creation Form Panel */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 p-6 sm:p-8 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Create Society Announcement
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              placeholder="e.g. Scheduled Lift Maintenance & Power Outage"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Notice Details / Circular Content *
            </label>
            <textarea
              rows={4}
              required
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              placeholder="Provide complete details, timings, emergency contact numbers, and guidelines..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Important Toggle Box */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <input
              type="checkbox"
              id="is_important"
              checked={newNotice.is_important}
              onChange={(e) => setNewNotice({ ...newNotice, is_important: e.target.checked })}
              className="w-5 h-5 text-rose-600 rounded-md focus:ring-rose-500 mt-0.5"
            />
            <label htmlFor="is_important" className="cursor-pointer">
              <span className="text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Mark as High-Priority Important Notice
              </span>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5 leading-snug">
                Important notices are permanently pinned at the top of the resident notice board and automatically trigger an email notification to all registered apartment residents.
              </p>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Notices List */}
      {loading ? (
        <LoadingSpinner text="Fetching notices list..." />
      ) : notices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
          <Megaphone className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No notices published yet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Click "Publish New Notice" above to draft an announcement.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-xs transition-all ${
                notice.is_important
                  ? 'border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.is_important ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white">
                        <Pin className="w-3 h-3" />
                        PINNED IMPORTANT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        General Notice #{notice.id}
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(notice.created_at)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                    {notice.content}
                  </p>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => setEditingNotice(notice)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(notice.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Notice Modal */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Notice #{editingNotice.id}
              </h3>
              <button
                onClick={() => setEditingNotice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingNotice.content}
                  onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="edit_is_important"
                  checked={Boolean(editingNotice.is_important)}
                  onChange={(e) => setEditingNotice({ ...editingNotice, is_important: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="edit_is_important" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                  Pinned Important Notice
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Notice Announcement"
        message="Are you sure you want to remove this notice? It will no longer be visible on the resident board."
        confirmText="Delete Notice"
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
