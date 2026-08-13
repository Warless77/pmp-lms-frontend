import { supabase } from '../lib/supabase.js';

export async function getDashboardAnalytics() {
  const [{ data: summaryData, error: summaryError }, { data: progressData, error: progressError }] = await Promise.all([
    supabase.rpc('pmp_get_learning_summary'),
    supabase.rpc('pmp_get_cloud_learning_progress')
  ]);
  if (summaryError) throw summaryError;
  if (progressError) throw progressError;
  const summary = Array.isArray(summaryData) ? summaryData[0] : summaryData;
  const progress = Array.isArray(progressData) ? progressData[0] : progressData;
  const answered = Number(summary?.questions_answered || 0);
  const correct = Number(summary?.correct_answers || 0);
  return {
    examReadiness: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    studyStreak: 0,
    modulesCompleted: Array.isArray(progress?.completed_modules) ? progress.completed_modules.length : 0,
    questionsAnswered: answered,
    flashcardsDue: Number(progress?.flashcards_due || 0),
    mockAttempts: summary?.mock_attempts || []
  };
}

export async function getExamReadiness() {
  const stats = await getDashboardAnalytics();
  return { readiness: stats.examReadiness };
}
