import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Clock, BellRing, Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-4 ring-8 ring-indigo-500/10">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Society Maintenance Tracker
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Smart Apartment Maintenance & Administration Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur-md">
          <Outlet />
        </div>

        {/* Feature Highlights beneath card */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-slate-400 text-xs">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Overdue Tracking</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit History</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Instant Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
