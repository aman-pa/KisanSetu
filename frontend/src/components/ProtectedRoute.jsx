import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified and user's role is not included
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to user's authorized role dashboard
    switch (role) {
      case 'FARMER':
        return <Navigate to="/farmer/dashboard" replace />;
      case 'FPO':
        return <Navigate to="/fpo/dashboard" replace />;
      case 'BULK_BUYER':
        return <Navigate to="/buyer/procurement" replace />;
      case 'LOGISTICS':
        return <Navigate to="/logistics/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/marketplace" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
