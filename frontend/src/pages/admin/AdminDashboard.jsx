import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { OverdueTag } from '../../components/common/OverdueTag';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatShortDate, formatDate } from '../../utils/formatters';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Activity,
  Flame,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminDashboardStats();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling society maintenance statistics..." />;
  }

  const {
    summary = {},
    byStatus = [],
    byCategory = [],
    byPriority = [],
    overdueList = [],
    recentActivity = []
  } = data || {};

  const total = summary.totalComplaints || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Admin Dashboard Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Administration Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Maintenance Overview & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time repair tickets, overdue escalation, and society operational metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Manage Complaints
          </Link>
          <Link
            to="/admin/notices"
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4 text-purple-600" />
            Post Notice
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Complaints"
          value={summary.totalComplaints}
          icon={ClipboardList}
          color="indigo"
          subtitle={`${summary.totalResidents || 0} registered residents`}
        />
        <StatCard
          title="Open Tickets"
          value={summary.openComplaints}
          icon={Clock}
          color="blue"
          subtitle="Pending technician assignment"
        />
        <StatCard
          title="In Progress"
          value={summary.inProgressComplaints}
          icon={Clock}
          color="amber"
          subtitle="Under repair / active"
        />
        <StatCard
          title="Resolved"
          value={summary.resolvedComplaints}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${total > 0 ? Math.round((summary.resolvedComplaints / total) * 100) : 0}% resolution rate`}
        />
        <StatCard
          title="Overdue Tickets"
          value={summary.overdueComplaints}
          icon={AlertTriangle}
          color="rose"
          badgeText={summary.overdueComplaints > 0 ? 'Urgent Action' : 'All Clear'}
          subtitle={`> ${summary.overdueDaysThreshold || 3} days unresolved`}
        />
      </div>

      {/* Critical Overdue Complaints Callout Section (if any) */}
      {overdueList.length > 0 && (
        <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-950 dark:text-rose-100">
                  Overdue Tickets Requiring Immediate Action ({summary.overdueComplaints})
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  These maintenance complaints have exceeded the {summary.overdueDaysThreshold}-day threshold without resolution.
                </p>
              </div>
            </div>
            <Link
              to="/admin/complaints?is_overdue=true"
              className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 flex items-center gap-1 shrink-0"
            >
              View All Overdue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueList.map((c) => (
              <Link
                key={c.id}
                to={`/complaints/${c.id}`}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 hover:border-rose-400 shadow-xs transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-400">#{c.id} • Flat {c.flat_number || 'N/A'}</span>
                  <OverdueTag daysOpen={c.days_open} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {c.title}
                </h4>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Analytics & Category Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Progress Bars) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Complaints by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency distribution across society departments
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {byCategory.length} Active Categories
            </span>
          </div>

          <div className="space-y-4">
            {byCategory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No category data available</p>
            ) : (
              byCategory.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                      <span className="text-slate-500">{item.count} tickets ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status & Priority Visual Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Status & Priority Health
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Current operational distribution
            </p>

            {/* Status Breakdown Pills */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">By Lifecycle Status</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {byStatus.map((s) => (
                  <div key={s.status} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.count}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">By Priority Level</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {byPriority.map((p) => (
                  <div key={p.priority} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{p.count}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{p.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/admin/complaints"
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Open Complaints Table <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Live Audit History & Activity Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent status transitions, administrator remarks, and complaint lifecycle events
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent activity logged</p>
          ) : (
            recentActivity.map((act) => (
              <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {act.actor_name || 'System / Resident'}
                      </span>
                      <span className="text-xs text-slate-400">
                        updated Ticket #{act.complaint_id} ({act.category})
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        → {act.new_status}
                      </span>
                    </div>
                    {act.note && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        "{act.note}"
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs text-slate-400 shrink-0 self-end sm:self-center">
                  {formatDate(act.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
