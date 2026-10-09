import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { RaiseComplaint } from './pages/resident/RaiseComplaint';
import { MyComplaints } from './pages/resident/MyComplaints';
import { ComplaintDetails } from './pages/resident/ComplaintDetails';
import { ResidentNotices } from './pages/resident/ResidentNotices';
import { Profile } from './pages/resident/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaints } from './pages/admin/AllComplaints';
import { NoticeManagement } from './pages/admin/NoticeManagement';

/**
 * Route protection wrapper requiring authenticated user
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If resident tries to access admin, redirect to resident dashboard
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

/**
 * Root index redirector based on authenticated user role
 */
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Authenticated Dashboard & Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Root index redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Resident Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['resident']}>
                    <ResidentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/new"
                element={
                  <ProtectedRoute allowedRoles={['resident']}>
                    <RaiseComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={['resident']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/notices" element={<ResidentNotices />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notices"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <NoticeManagement />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
