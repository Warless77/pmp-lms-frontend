import { supabase } from '../lib/supabase.js';

export async function getModules() {
  const { data, error } = await supabase.from('modules').select('id, slug, title, domain, description, position, is_published, required_plan').eq('is_published', true).order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getQuestions(limit = 50) {
  const { data, error } = await supabase.rpc('pmp_get_learner_questions', { p_limit: limit });
  if (error) throw error;
  return (data || []).map(normaliseQuestion);
}

export async function getLearnerEntitlement() {
  const { data, error } = await supabase.rpc('pmp_get_learner_entitlement');
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return {
    tier: result?.tier || 'none', expiresAt: result?.expires_at || null,
    flashcardLimit: Number(result?.flashcard_limit || 0),
    practiceLimit: result?.practice_limit === null ? null : Number(result?.practice_limit || 0),
    practiceUsed: Number(result?.practice_used || 0),
    practiceRemaining: result?.practice_remaining === null ? null : Number(result?.practice_remaining || 0),
    questionBankEnabled: Boolean(result?.question_bank_enabled), mockExamEnabled: Boolean(result?.mock_exam_enabled),
    aiCoachEnabled: Boolean(result?.ai_coach_enabled), modulesEnabled: Boolean(result?.modules_enabled),
    analyticsEnabled: Boolean(result?.analytics_enabled), certificatesEnabled: Boolean(result?.certificates_enabled)
  };
}

export async function getPracticeQuestions(limit = 20, firstQuestionId = null) {
  const request = firstQuestionId ? supabase.rpc('pmp_get_practice_questions_for_question', { p_question_id: firstQuestionId, p_limit: limit }) : supabase.rpc('pmp_get_practice_questions', { p_limit: limit });
  const { data, error } = await request;
  if (error) throw error;
  return (data || []).map(normaliseQuestion);
}

export async function gradePracticeAnswer(questionId, selectedIndex) {
  const { data, error } = await supabase.rpc('pmp_grade_practice_answer', { p_question_id: questionId, p_selected_index: selectedIndex });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { isCorrect: Boolean(result?.is_correct), explanation: result?.explanation || '' };
}

export async function startMockExam(durationSeconds = 13800) {
  const { data, error } = await supabase.rpc('pmp_start_mock_exam', { p_duration_seconds: durationSeconds });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { sessionId: result?.session_id, expiresAt: result?.expires_at, questions: (result?.questions || []).map(normaliseQuestion) };
}

export async function submitMockExamSession(sessionId, answers) {
  const { data, error } = await supabase.rpc('pmp_submit_mock_exam_session', { p_session_id: sessionId, p_answers: answers });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { score: Number(result?.score || 0), total: Number(result?.total || 180), attemptId: result?.attempt_id, review: Array.isArray(result?.review) ? result.review : [], expired: Boolean(result?.expired) };
}

export async function submitMockAttempt(answers, elapsedSeconds) {
  const { data, error } = await supabase.rpc('pmp_submit_mock_attempt', { p_answers: answers, p_elapsed_seconds: elapsedSeconds });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { score: Number(result?.score || 0), total: Number(result?.total || 180), attemptId: result?.attempt_id, review: Array.isArray(result?.review) ? result.review : [] };
}

export async function getFlashcards(limit = 1000, domain = null) {
  const safeLimit = Math.min(Math.max(Number(limit) || 1, 1), 1000);
  const { data, error } = await supabase.rpc('pmp_get_flashcards', { p_limit: safeLimit, p_domain: domain === 'All' ? null : domain });
  if (error) throw error;
  return (data || []).map((card) => ({ id: card.id, domain: formatFlashcardDomain(card.domain), front: card.front, back: card.back }));
}

function normaliseQuestion(question) {
  return { id: question.id, text: question.question_text, options: normaliseOptions(question.options), domain: question.domain };
}

function normaliseOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try { const parsed = JSON.parse(options); if (Array.isArray(parsed)) return parsed; }
    catch { return options.split(/\n|\|/).map((option) => option.trim()).filter(Boolean); }
  }
  return [];
}

function formatFlashcardDomain(domain) {
  if (domain === 'business_environment' || domain === 'business') return 'Business Environment';
  if (domain === 'people') return 'People';
  if (domain === 'process') return 'Process';
  return domain || 'PMP';
}
