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

export async function getLearningSummary() {
  if (!supabase) return getLearnerProgress();
  const { data, error } = await supabase.rpc('pmp_get_learning_summary');
  if (error) throw error;
  const summary = Array.isArray(data) ? data[0] : data;
  return {
    ...getLearnerProgress(),
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
