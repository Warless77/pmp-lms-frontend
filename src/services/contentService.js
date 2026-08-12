import { supabase } from '../lib/supabase.js';

export async function getModules() {
  const { data, error } = await supabase
    .from('modules')
    .select('id, slug, title, domain, description, position, is_published, required_plan')
    .eq('is_published', true)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getQuestions(limit = 50) {
  const { data, error } = await supabase.rpc('pmp_get_learner_questions', { p_limit: limit });
  if (error) throw error;
  return data || [];
}

export async function getFlashcards(limit = 20, domain = null) {
  const { data, error } = await supabase.rpc('pmp_get_flashcards', {
    p_limit: limit,
    p_domain: domain,
  });
  if (error) throw error;
  return data || [];
}
