import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../context/ToastContext';
import { COMPLAINT_CATEGORIES } from '../../utils/formatters';
import {
  Wrench,
  Zap,
  Sparkles,
  Shield,
  ArrowUpDown,
  Droplets,
  Car,
  Layers,
  HelpCircle,
  UploadCloud,
  X,
  PlusCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export const RaiseComplaint = () => {
  const [category, setCategory] = useState('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const categoryIcons = {
    'Plumbing': Droplets,
    'Electrical': Zap,
    'Cleaning': Sparkles,
    'Security': Shield,
    'Lift/Elevator': ArrowUpDown,
    'Water Supply': Droplets,
    'Parking': Car,
    'Common Area': Layers,
    'Other': HelpCircle,
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File size exceeds 5MB limit. Please select a smaller photo.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !description.trim()) {
      error('Please select a category and provide an issue description.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title.trim() || `${category} Maintenance Request`);
      formData.append('description', description.trim());
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await complaintService.createComplaint(formData);
      success('Complaint lodged successfully! Our admin team has been notified.');
      navigate(`/complaints/${response.data.complaint.id}`);
    } catch (err) {
      error(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Raise Maintenance Complaint
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit details regarding issues in your apartment unit or society common premises.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Category Selector Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            1. Select Complaint Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {COMPLAINT_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat] || HelpCircle;
              const isSelected = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            2. Issue Summary / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master bedroom AC circuit tripping, water pipe leaking..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            3. Detailed Description *
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide specific location, symptoms, urgency details, and access instructions..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Photo Upload Zone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            4. Attach Photo (Optional)
          </label>

          {photoPreview ? (
            <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              <img
                src={photoPreview}
                alt="Upload preview"
                className="w-48 h-36 object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors shadow-md"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 transition-all">
              <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Click or drag & drop to upload a photo
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, WebP up to 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? 'Submitting Ticket...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};
