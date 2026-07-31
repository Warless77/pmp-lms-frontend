const STORAGE_KEY = 'pmp-lms:learner-progress:v1';
import { supabase } from './supabaseClient.js';

const initialState = {
  answeredQuestionIds: [],
  correctQuestionIds: [],
  flashcardsReviewed: 0,
  completedModules: [],
  mockAttempts: [],
  settings: { notifications: true, darkMode: false, studyReminders: true }
};

function read() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return { ...initialState, ...stored, settings: { ...initialState.settings, ...(stored?.settings || {}) } };
  } catch {
    return { ...initialState, settings: { ...initialState.settings } };
  }
}

function write(next) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('pmp-progress-change'));
  return next;
}

export function getLearnerProgress() {
  return read();
}

function notify() {
  window.dispatchEvent(new Event('pmp-progress-change'));
}

export function recordAnswer(questionId, isCorrect) {
  const state = read();
  const answered = new Set(state.answeredQuestionIds);
  const correct = new Set(state.correctQuestionIds);
  answered.add(String(questionId));
  if (isCorrect) correct.add(String(questionId));
  else correct.delete(String(questionId));
  return write({ ...state, answeredQuestionIds: [...answered], correctQuestionIds: [...correct] });
}

export function recordMockAttempt({ score, total, elapsedSeconds }) {
  const state = read();
  return write({
    ...state,
    mockAttempts: [{ score, total, elapsedSeconds, completedAt: new Date().toISOString() }, ...state.mockAttempts].slice(0, 10)
  });
}

export function recordFlashcardReview() {
  const state = read();
  return write({ ...state, flashcardsReviewed: state.flashcardsReviewed + 1 });
}

export function toggleModuleComplete(moduleId) {
  const state = read();
  const completed = new Set(state.completedModules);
  if (completed.has(moduleId)) completed.delete(moduleId);
  else completed.add(moduleId);
  return write({ ...state, completedModules: [...completed] });
}

export function saveSettings(settings) {
  const state = read();
  return write({ ...state, settings: { ...state.settings, ...settings } });
}

export async function getCloudLearnerProgress() {
  if (!supabase) return getLearnerProgress();
  const [{ data, error }, { data: settingsData, error: settingsError }] = await Promise.all([
    supabase.rpc('pmp_get_cloud_learning_progress'),
    supabase.from('pmp_learner_settings').select('notifications, dark_mode, study_reminders').maybeSingle()
  ]);
  if (error) throw error;
  if (settingsError) throw settingsError;
  const cloud = Array.isArray(data) ? data[0] : data;
  const settings = settingsData
    ? { notifications: settingsData.notifications, darkMode: settingsData.dark_mode, studyReminders: settingsData.study_reminders }
    : (cloud?.settings || initialState.settings);
  return {
    ...initialState,
    completedModules: cloud?.completed_modules || [],
    flashcardsReviewed: Number(cloud?.flashcards_reviewed || 0),
    settings
  };
}

export async function setModuleComplete(moduleId, completed) {
  if (!supabase) return toggleModuleComplete(moduleId);
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError) throw identityError;
  if (!identity.user) throw new Error('Please sign in again.');
  const { error } = await supabase.from('pmp_module_progress').upsert({
    user_id: identity.user.id,
    module_id: moduleId,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
  notify();
}

export async function saveCloudFlashcardReview(flashcardId, rating) {
  if (!supabase) return recordFlashcardReview();
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError) throw identityError;
  if (!identity.user) throw new Error('Please sign in again.');
  const { data: existing, error: existingError } = await supabase
    .from('pmp_flashcard_reviews').select('review_count').eq('flashcard_id', String(flashcardId)).maybeSingle();
  if (existingError) throw existingError;
  const days = rating === 'easy' ? 7 : rating === 'medium' ? 3 : 1;
  const { error } = await supabase.from('pmp_flashcard_reviews').upsert({
    user_id: identity.user.id,
    flashcard_id: String(flashcardId),
    last_rating: rating,
    review_count: Number(existing?.review_count || 0) + 1,
    last_reviewed_at: new Date().toISOString(),
    due_at: new Date(Date.now() + days * 86400000).toISOString()
  });
  if (error) throw error;
  notify();
}

export async function saveCloudSettings(settings) {
  if (!supabase) return saveSettings(settings);
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError) throw identityError;
  if (!identity.user) throw new Error('Please sign in again.');
  const { error } = await supabase.from('pmp_learner_settings').upsert({
    user_id: identity.user.id,
    notifications: settings.notifications,
    dark_mode: settings.darkMode,
    study_reminders: settings.studyReminders,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
  notify();
}

export async function getLearningSummary() {
  if (!supabase) return getLearnerProgress();
  const { data, error } = await supabase.rpc('pmp_get_learning_summary');
  if (error) throw error;
  const summary = Array.isArray(data) ? data[0] : data;
  const cloud = await getCloudLearnerProgress();
  return {
    ...cloud,
    answeredCount: Number(summary?.questions_answered || 0),
    correctCount: Number(summary?.correct_answers || 0),
    mockAttempts: summary?.mock_attempts || []
  };
}

export async function getDomainPerformance() {
  if (!supabase) return {};
  const { data, error } = await supabase.rpc('pmp_get_domain_performance');
  if (error) throw error;
  return Object.fromEntries((data || []).map((item) => [
    (item.domain || 'general_pmp').replaceAll('_', ' '),
    Number(item.questions_answered) ? Math.round((Number(item.correct_answers) / Number(item.questions_answered)) * 100) : 0
  ]));
}
