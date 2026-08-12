import { supabase } from '../lib/supabase.js';

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function register({ name, email, password, targetDate, plan = 'trial' }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: name.trim(),
        target_exam_date: targetDate || null,
        plan,
      },
    },
  });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
