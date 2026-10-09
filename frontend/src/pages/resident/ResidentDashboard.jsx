import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import { noticeService } from '../../services/noticeService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { OverdueTag } from '../../components/common/OverdueTag';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatShortDate } from '../../utils/formatters';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Megaphone,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';

export const ResidentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [complaintsRes, noticesRes] = await Promise.all([
          complaintService.getMyComplaints(),
          noticeService.getAllNotices()
        ]);
        setComplaints(complaintsRes.data?.complaints || []);
        setNotices(noticesRes.data?.notices || []);
      } catch (err) {
        console.error('Failed to load resident dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your resident dashboard..." />;
  }

  const total = complaints.length;
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const overdueCount = complaints.filter(c => c.is_overdue).length;

  const importantNotices = notices.filter(n => n.is_important);
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Resident Hub • Flat {user?.flat_number || 'Unit'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-indigo-200 max-w-xl">
              Track active maintenance requests, view past repair history, and stay updated with official society announcements.
            </p>
          </div>

          <Link
            to="/complaints/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            Raise New Complaint
          </Link>
        </div>
      </div>

      {/* Pinned Important Notices Alert Banner (if any) */}
      {importantNotices.length > 0 && (
        <div className="space-y-3">
          {importantNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-300 shrink-0">
                  <Megaphone className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white rounded-full">
                      Important Notice
                    </span>
                    <span className="text-xs text-rose-500 font-medium">
                      {formatShortDate(notice.created_at)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100 mt-1">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-rose-850 dark:text-rose-300 line-clamp-2 mt-0.5">
                    {notice.content}
                  </p>
                </div>
              </div>

              <Link
                to="/notices"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 shrink-0 self-end sm:self-center"
              >
                Read All Notices <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Filed"
          value={total}
          icon={ClipboardList}
          color="indigo"
          subtitle="All-time requests"
        />
        <StatCard
          title="Open"
          value={openCount}
          icon={Clock}
          color="blue"
          subtitle="Awaiting technician"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="amber"
          subtitle="Currently underway"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed repairs"
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          color="rose"
          badgeText={overdueCount > 0 ? 'Action Needed' : null}
          subtitle="Tickets > 3 days open"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              My Recent Complaints
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status and latest updates from society management
            </p>
          </div>
          <Link
            to="/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            View All ({total}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No maintenance complaints raised yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              If something needs fixing in your flat or the common premises, submit a new ticket.
            </p>
            <Link
              to="/complaints/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Complaint Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentComplaints.map((c) => (
              <Link
                key={c.id}
                to={`/complaints/${c.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-all"
              >
                <div className="flex items-start gap-3.5">
                  {c.photo_url ? (
                    <img
                      src={c.photo_url}
                      alt={c.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                      {c.category.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{c.id}</span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {c.category}
                      </span>
                      {c.is_overdue && <OverdueTag daysOpen={c.days_open} />}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {c.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
