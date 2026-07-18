import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ adminOnly = false }) {
  const { account, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="route-status">Checking your secure session…</div>;
  if (!account) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!account.profile?.is_active) return <div className="route-status">This beta account is inactive.</div>;
  if (adminOnly && account.profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default ProtectedRoute;
