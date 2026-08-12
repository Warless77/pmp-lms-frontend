import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setState({ loading: false, authenticated: Boolean(data.session) });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setState({ loading: false, authenticated: Boolean(session) });
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (state.loading) return <div style={{ padding: '2rem' }}>Loading…</div>;
  if (!state.authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default ProtectedRoute;
