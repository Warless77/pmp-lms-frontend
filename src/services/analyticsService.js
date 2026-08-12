import { supabase } from '../lib/supabase.js';

export async function getDashboardAnalytics() {
  const { data, error } = await supabase.rpc('pmp_get_learning_summary');
  if (error) throw error;

  const summary = data?.[0] || {
    questions_answered: 0,
    correct_answers: 0,
    mock_attempts: [],
  };

  const answered = Number(summary.questions_answered || 0);
  const correct = Number(summary.correct_answers || 0);
  const readiness = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return {
    examReadiness: readiness,
    studyStreak: 0,
    modulesCompleted: 0,
    questionsAnswered: answered,
    flashcardsDue: 0,
    mockAttempts: summary.mock_attempts || [],
  };
}

export async function getExamReadiness() {
  const stats = await getDashboardAnalytics();
  return { readiness: stats.examReadiness };
}
