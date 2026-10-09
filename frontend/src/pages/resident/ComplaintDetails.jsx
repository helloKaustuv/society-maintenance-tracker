import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { OverdueTag } from '../../components/common/OverdueTag';
import { StatusHistoryTimeline } from '../../components/complaints/StatusHistoryTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Calendar,
  User,
  Home,
  FileText,
  Clock,
  CheckCircle2,
  Maximize2,
  X,
  Phone,
  AlertCircle
} from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      setComplaint(res.data?.complaint);
      setHistory(res.data?.history || []);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text={`Loading complaint #${id}...`} />;
  }

  if (!complaint) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Complaint not found
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested complaint does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>

        <div className="flex items-center gap-2">
          {complaint.is_overdue && <OverdueTag daysOpen={complaint.days_open} />}
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Complaint Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 mb-2">
          <span>TICKET #{complaint.id}</span>
          <span>•</span>
          <span className="text-indigo-600 dark:text-indigo-400">{complaint.category}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {complaint.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 py-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Logged on: {formatDate(complaint.created_at)}</span>
          </div>

          {complaint.resolved_at && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved on: {formatDate(complaint.resolved_at)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Flat: {complaint.flat_number || 'N/A'}</span>
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description of the Issue
          </h3>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {complaint.description}
          </p>
        </div>

        {/* Attached Photo */}
        {complaint.photo_url && (
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Attached Photo
            </h3>
            <div className="relative inline-block group">
              <img
                src={complaint.photo_url}
                alt="Complaint attachment"
                className="w-64 h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer group-hover:opacity-90 transition-all"
                onClick={() => setIsPhotoZoomed(true)}
              />
              <button
                onClick={() => setIsPhotoZoomed(true)}
                className="absolute bottom-3 right-3 p-2 bg-slate-900/80 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title="Zoom photo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Chronological Status History Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Complete Status History & Audit Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of all status transitions, timestamps, and technician notes
            </p>
          </div>
        </div>

        <StatusHistoryTimeline history={history} />
      </div>

      {/* Photo Zoom Modal */}
      {isPhotoZoomed && (
        <div
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setIsPhotoZoomed(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={complaint.photo_url}
            alt="Zoomed attachment"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
