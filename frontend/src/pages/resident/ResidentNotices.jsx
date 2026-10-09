import React, { useState, useEffect } from 'react';
import { noticeService } from '../../services/noticeService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  Megaphone,
  AlertTriangle,
  Calendar,
  User,
  Search,
  Pin,
  Inbox
} from 'lucide-react';

export const ResidentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeService.getAllNotices();
      setNotices(res.data?.notices || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term);
  });

  const pinnedNotices = filteredNotices.filter((n) => n.is_important);
  const regularNotices = filteredNotices.filter((n) => !n.is_important);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Society Notice Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official announcements, maintenance schedules, and society circulars
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching society notices..." />
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No notices published
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no announcements matching your search query.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Important Announcements Section */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Pin className="w-4 h-4" />
                <span>Pinned High-Priority Notices</span>
              </div>

              <div className="space-y-4">
                {pinnedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 p-6 sm:p-7 shadow-md relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        IMPORTANT
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(notice.created_at)}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {notice.title}
                    </h2>

                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {notice.content}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Posted by <strong>{notice.author_name || 'Society Management'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Society Notices Section */}
          {regularNotices.length > 0 && (
            <div className="space-y-3">
              {pinnedNotices.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 pt-2">
                  <Megaphone className="w-4 h-4" />
                  <span>General Announcements</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Notice #{notice.id}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(notice.created_at)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {notice.title}
                      </h3>

                      <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {notice.content}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      <span>Posted by {notice.author_name || 'Society Management'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
