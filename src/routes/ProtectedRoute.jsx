import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';

/** Protect routes by role(s) */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <Spinner fullScreen text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
