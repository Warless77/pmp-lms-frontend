import { getLearnerProgress, getLearningSummary, getDomainPerformance } from './learnerProgressService.js';
import { getQuestions } from './contentService.js';

export async function getDashboardAnalytics() {
  const [progress, questions] = await Promise.all([getLearningSummary(), getQuestions()]);
  const answered = progress.answeredCount ?? progress.answeredQuestionIds.length;
  const correct = progress.correctCount ?? progress.correctQuestionIds.length;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const readiness = answered ? Math.round((accuracy * 0.7) + (Math.min(answered / Math.max(questions.length, 1), 1) * 30)) : 0;
  return {
    examReadiness: readiness,
    studyStreak: answered || progress.flashcardsReviewed ? 1 : 0,
    modulesCompleted: progress.completedModules.length,
    questionsAnswered: answered,
    flashcardsDue: Math.max(0, 20 - progress.flashcardsReviewed),
    accuracy,
    mockAttempts: progress.mockAttempts
  };
}

export async function getLearnerAnalytics() {
  const [dashboard, domainPerformance] = await Promise.all([getDashboardAnalytics(), getDomainPerformance()]);
  return {
    ...dashboard,
    domainPerformance
  };
}
