const STORAGE_KEY = 'pmp-lms:learner-progress:v1';

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
