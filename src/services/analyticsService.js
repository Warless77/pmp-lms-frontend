import { getLearnerProgress } from './learnerProgressService.js';
import { getQuestions } from './contentService.js';

export async function getDashboardAnalytics() {
  const progress = getLearnerProgress();
  const questions = await getQuestions();
  const answered = progress.answeredQuestionIds.length;
  const accuracy = answered ? Math.round((progress.correctQuestionIds.length / answered) * 100) : 0;
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
  const [questions, dashboard] = await Promise.all([getQuestions(), getDashboardAnalytics()]);
  const progress = getLearnerProgress();
  const answered = new Set(progress.answeredQuestionIds);
  const correct = new Set(progress.correctQuestionIds);
  const domainPerformance = questions.reduce((accumulator, question) => {
    const label = (question.domain || 'general_pmp').replaceAll('_', ' ');
    if (!accumulator[label]) accumulator[label] = { answered: 0, correct: 0 };
    if (answered.has(String(question.id))) {
      accumulator[label].answered += 1;
      if (correct.has(String(question.id))) accumulator[label].correct += 1;
    }
    return accumulator;
  }, {});
  return {
    ...dashboard,
    domainPerformance: Object.fromEntries(Object.entries(domainPerformance).map(([name, result]) => [name, result.answered ? Math.round((result.correct / result.answered) * 100) : 0]))
  };
}
