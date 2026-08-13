import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

async function loadAccount() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) return null;
  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  if (profileError) throw profileError;
  return { user, profile };
}

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try { setAccount(await loadAccount()); }
    catch { setAccount(null); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    refresh();
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
