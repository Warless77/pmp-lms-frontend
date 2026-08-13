import { supabase } from '../lib/supabase.js';

export async function askAICoach(message, context = '') {
  const trimmed = String(message || '').trim();
  if (!trimmed) throw new Error('Please enter a question.');
  if (trimmed.length > 4000) throw new Error('Question must be 4000 characters or fewer.');

  const { data, error } = await supabase.functions.invoke('ai-coach', {
    body: { message: trimmed, context: String(context || '').slice(0, 6000) },
  });

  if (error) throw new Error(error.message || 'Unable to reach AI Coach.');
  if (data?.error) throw new Error(data.error);
  if (!data?.answer) throw new Error('AI Coach returned an empty response.');
  return data.answer;
}
