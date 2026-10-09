import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { OverdueTag } from '../../components/common/OverdueTag';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { PriorityUpdateModal } from '../../components/complaints/PriorityUpdateModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COMPLAINT_CATEGORIES, formatShortDate, formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  RefreshCw,
  Flame,
  Clock,
  Eye,
  Calendar,
  User,
  Home,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  ArrowUpDown
} from 'lucide-react';

export const AllComplaints = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialOverdue = queryParams.get('is_overdue') === 'true';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(initialOverdue);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [statusModalComplaint, setStatusModalComplaint] = useState(null);
  const [priorityModalComplaint, setPriorityModalComplaint] = useState(null);

  const { success, error } = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (overdueOnly) params.is_overdue = 'true';
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await complaintService.getAllComplaintsAdmin(params);
      setComplaints(res.data?.complaints || []);
    } catch (err) {
      console.error('Failed to fetch admin complaints:', err);
      error('Failed to load complaints table.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, overdueOnly, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleStatusUpdate = async (id, { status, note }) => {
    try {
      setModalLoading(true);
      const res = await complaintService.updateComplaintStatusAdmin(id, { status, note });
      success(res.message || 'Complaint status updated successfully!');
      setStatusModalComplaint(null);
      fetchComplaints();
    } catch (err) {
      error(err.message || 'Failed to update status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handlePriorityUpdate = async (id, { priority }) => {
    try {
      setModalLoading(true);
      const res = await complaintService.updateComplaintPriorityAdmin(id, { priority });
      success(res.message || 'Priority updated successfully!');
      setPriorityModalComplaint(null);
      fetchComplaints();
    } catch (err) {
      error(err.message || 'Failed to update priority.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Society Complaints Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage complaints, assign technician priorities, update resolution statuses, and view audit history.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
        {/* Row 1: Search & Overdue Toggle */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket #, resident name, flat number, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </form>

          {/* Overdue Switch Button */}
          <button
            type="button"
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              overdueOnly
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-500/30'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue Only {overdueOnly ? '✓ Active' : ''}</span>
          </button>
        </div>

        {/* Row 2: Category, Status, Priority, Date Range */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Complaints Management Table */}
      {loading ? (
        <LoadingSpinner text="Fetching society complaints..." />
      ) : complaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No complaints found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing filters or search terms.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Ticket</th>
                  <th className="px-5 py-4">Resident / Flat</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      c.is_overdue ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Ticket & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt={c.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                            #{c.id}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 text-xs">#{c.id}</span>
                            {c.is_overdue && <OverdueTag daysOpen={c.days_open} />}
                          </div>
                          <Link
                            to={`/complaints/${c.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors block line-clamp-1 mt-0.5"
                          >
                            {c.title}
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Resident Info */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {c.resident_name || 'Resident'}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Home className="w-3 h-3 text-slate-400" />
                          {c.flat_number || 'Unit N/A'}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        {c.category}
                      </span>
                    </td>

                    {/* Priority (with quick-edit trigger) */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setPriorityModalComplaint(c)}
                        title="Click to change priority"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <PriorityBadge priority={c.priority} />
                      </button>
                    </td>

                    {/* Status (with quick-edit trigger) */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setStatusModalComplaint(c)}
                        title="Click to update status & add note"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <StatusBadge status={c.status} />
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatShortDate(c.created_at)}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setStatusModalComplaint(c)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors font-semibold text-xs flex items-center gap-1"
                          title="Change Status & Add Note"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Status</span>
                        </button>

                        <button
                          onClick={() => setPriorityModalComplaint(c)}
                          className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors font-semibold text-xs flex items-center gap-1"
                          title="Change Priority"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Priority</span>
                        </button>

                        <Link
                          to={`/complaints/${c.id}`}
                          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Full Details & History Timeline"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalComplaint && (
        <StatusUpdateModal
          isOpen={Boolean(statusModalComplaint)}
          complaint={statusModalComplaint}
          loading={modalLoading}
          onClose={() => setStatusModalComplaint(null)}
          onUpdateStatus={handleStatusUpdate}
        />
      )}

      {/* Priority Update Modal */}
      {priorityModalComplaint && (
        <PriorityUpdateModal
          isOpen={Boolean(priorityModalComplaint)}
          complaint={priorityModalComplaint}
          loading={modalLoading}
          onClose={() => setPriorityModalComplaint(null)}
          onUpdatePriority={handlePriorityUpdate}
        />
      )}
    </div>
  );
};
