import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { CompleteProfile } from './pages/auth/CompleteProfile';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LandingPage } from './pages/LandingPage';
import { SuspendedAccount } from './pages/auth/SuspendedAccount';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['student', 'admin', 'boss'] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-accent">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!profile?.is_profile_complete) {
    return <Navigate to="/complete-profile" />;
  }

  if (!allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-accent">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (user && profile?.is_profile_complete) {
    if (profile.role === 'admin' || profile.role === 'boss') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/student" />;
  }

  return children;
};

const AppContent = () => {
  const { profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/complete-profile" element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'boss']}>
            <CompleteProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/suspended" element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'boss']}>
            <SuspendedAccount />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student/courses/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student/lectures/:lectureId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'boss']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin', 'boss']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/lectures" element={
          <ProtectedRoute allowedRoles={['admin', 'boss']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/payments" element={
          <ProtectedRoute allowedRoles={['admin', 'boss']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/codes" element={
          <ProtectedRoute allowedRoles={['admin', 'boss']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};