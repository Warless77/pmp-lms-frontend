import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../services/authService.js';
import { supabase } from '../services/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try { setAccount(await getCurrentUser()); }
    catch { setAccount(null); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    refresh();
    if (!supabase) return undefined;
    const { data } = supabase.auth.onAuthStateChange(() => refresh());
    return () => data.subscription.unsubscribe();
  }, []);
  const value = useMemo(() => ({ account, loading, refresh }), [account, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
