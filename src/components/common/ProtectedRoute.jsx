import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FullScreenLoader } from './Loader';

export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader text="Verifying your account..." />;
  }

  if (!isAuthenticated) {
    const redirectPath = requiredRole === 'captain' ? '/captain/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Cross-role redirect
    if (role === 'captain') {
      return <Navigate to="/captain/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
