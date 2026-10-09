import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, User, Menu, Shield, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3.5">
        {/* Left Side: Mobile Menu Button & Brand Indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Society Tracker
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Maintenance & Resident Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Role Badge, User Info, Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Role Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs">
            {isAdmin ? (
              <span className="flex items-center gap-1 text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
                <Shield className="w-3 h-3 text-purple-600" />
                Admin Panel
              </span>
            ) : (
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                <Home className="w-3 h-3 text-blue-600" />
                Resident Portal
              </span>
            )}
          </div>

          {/* User Profile Info */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {user?.flat_number || user?.email}
              </p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
