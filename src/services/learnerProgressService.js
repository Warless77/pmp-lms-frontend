import { supabase } from '../lib/supabase.js';

const STORAGE_KEY = 'pmp-lms:learner-progress:v2';
const initialState = { answeredQuestionIds: [], correctQuestionIds: [], flashcardsReviewed: 0, completedModules: [], mockAttempts: [] };

function read() {
  try { return { ...initialState, ...(JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {}) }; }
  catch { return { ...initialState }; }
}

function write(next) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('pmp-progress-change'));
  return next;
}

export function getLearnerProgress() { return read(); }

export function recordAnswer(questionId, isCorrect) {
  const state = read();
  const answered = new Set(state.answeredQuestionIds); const correct = new Set(state.correctQuestionIds);
  answered.add(String(questionId));
  if (isCorrect) correct.add(String(questionId)); else correct.delete(String(questionId));
  return write({ ...state, answeredQuestionIds: [...answered], correctQuestionIds: [...correct] });
}

export function recordMockAttempt(attempt) {
  const state = read();
  return write({ ...state, mockAttempts: [attempt, ...state.mockAttempts].slice(0, 10) });
}

export function recordFlashcardReview() {
  const state = read();
  return write({ ...state, flashcardsReviewed: state.flashcardsReviewed + 1 });
}

export async function getCloudLearnerProgress() {
  const { data, error } = await supabase.rpc('pmp_get_cloud_learning_progress');
  if (error) throw error;
  const cloud = Array.isArray(data) ? data[0] : data;
  return { ...initialState, completedModules: cloud?.completed_modules || [], flashcardsReviewed: Number(cloud?.flashcards_reviewed || 0) };
}

export async function saveCloudFlashcardReview(flashcardId, rating) {
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError) throw identityError;
  if (!identity.user) throw new Error('Please sign in again.');
  const { data: existing, error: existingError } = await supabase.from('pmp_flashcard_reviews').select('review_count').eq('user_id', identity.user.id).eq('flashcard_id', String(flashcardId)).maybeSingle();
  if (existingError) throw existingError;
  const days = rating === 'easy' ? 7 : rating === 'medium' ? 3 : 1;
  const { error } = await supabase.from('pmp_flashcard_reviews').upsert({
    user_id: identity.user.id, flashcard_id: String(flashcardId), last_rating: rating,
    review_count: Number(existing?.review_count || 0) + 1,
    last_reviewed_at: new Date().toISOString(), due_at: new Date(Date.now() + days * 86400000).toISOString()
  }, { onConflict: 'user_id,flashcard_id' });
  if (error) throw error;
  recordFlashcardReview();
}

export async function getLearningSummary() {
  const { data, error } = await supabase.rpc('pmp_get_learning_summary');
  if (error) throw error;
  const summary = Array.isArray(data) ? data[0] : data;
  return { answeredCount: Number(summary?.questions_answered || 0), correctCount: Number(summary?.correct_answers || 0), mockAttempts: summary?.mock_attempts || [] };
}

export async function getDomainPerformance() {
  const { data, error } = await supabase.rpc('pmp_get_domain_performance');
  if (error) throw error;
  return Object.fromEntries((data || []).map((item) => [
    (item.domain || 'general_pmp').replaceAll('_', ' '),
    Number(item.questions_answered) ? Math.round((Number(item.correct_answers) / Number(item.questions_answered)) * 100) : 0
  ]));
}
