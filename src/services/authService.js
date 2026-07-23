import { requireSupabase } from './supabaseClient.js';

export async function login({ email, password }) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(), password
  });
  if (error) throw error;
  return data;
}

export async function register({ name, email, password, targetDate }) {
  const { data, error } = await requireSupabase().auth.signUp({
    email: email.trim().toLowerCase(), password,
    options: { data: { full_name: name.trim(), target_exam_date: targetDate || null } }
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const client = requireSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;
  const { data: profile, error: profileError } = await client
    .from('profiles').select('*').eq('id', user.id).single();
  if (profileError) throw profileError;
  return { user, profile };
}

export async function requestPasswordReset(email) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(
    email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/settings` }
  );
  if (error) throw error;
}
