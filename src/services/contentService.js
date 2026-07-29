import { modules, flashcards } from '../data/mockData.js';
import { supabase } from './supabaseClient.js';
import { getCloudLearnerProgress } from './learnerProgressService.js';

/**
 * Placeholder content service returning mock data. This layer abstracts data
 * retrieval and can later be extended to call REST or GraphQL APIs.
 */

export async function getModules() {
  const { completedModules } = await getCloudLearnerProgress();
  return modules.map((module) => ({
    ...module,
    progress: completedModules.includes(module.id) ? 100 : 0
  }));
}

export function getQuestions(limit = 180) {
  if (!supabase) return Promise.reject(new Error('The private beta question service is not configured.'));

  return supabase
    .rpc('pmp_get_learner_questions', { p_limit: limit })
    .then(({ data, error }) => {
      if (error) throw error;
      return (data || []).map((question) => ({
        id: question.id,
        text: question.question_text,
        options: normaliseOptions(question.options),
        domain: question.domain
      }));
    });
}

export function getPracticeQuestions(limit = 20, firstQuestionId = null) {
  if (!supabase) return Promise.reject(new Error('The private beta question service is not configured.'));
  const request = firstQuestionId
    ? supabase.rpc('pmp_get_practice_questions_for_question', { p_question_id: firstQuestionId, p_limit: limit })
    : supabase.rpc('pmp_get_practice_questions', { p_limit: limit });
  return request.then(({ data, error }) => {
    if (error) throw error;
    return (data || []).map((question) => ({ id: question.id, text: question.question_text, options: normaliseOptions(question.options), domain: question.domain }));
  });
}

export async function gradePracticeAnswer(questionId, selectedIndex) {
  if (!supabase) throw new Error('The private beta question service is not configured.');
  const { data, error } = await supabase.rpc('pmp_grade_practice_answer', {
    p_question_id: questionId,
    p_selected_index: selectedIndex
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { isCorrect: Boolean(result?.is_correct), explanation: result?.explanation || '' };
}

export async function submitMockAttempt(answers, elapsedSeconds) {
  if (!supabase) throw new Error('The private beta question service is not configured.');
  const { data, error } = await supabase.rpc('pmp_submit_mock_attempt_review', {
    p_answers: answers,
    p_elapsed_seconds: elapsedSeconds
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { score: Number(result?.score || 0), total: Number(result?.total || 0), attemptId: result?.attempt_id, review: Array.isArray(result?.review) ? result.review : [] };
}

export async function startMockExam(durationSeconds = 13800) {
  if (!supabase) throw new Error('The private beta question service is not configured.');
  const { data, error } = await supabase.rpc('pmp_start_mock_exam', { p_duration_seconds: durationSeconds });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { sessionId: result?.session_id, expiresAt: result?.expires_at, questions: (result?.questions || []).map((question) => ({ id: question.id, text: question.question_text, options: normaliseOptions(question.options), domain: question.domain })) };
}

export async function submitMockExamSession(sessionId, answers) {
  if (!supabase) throw new Error('The private beta question service is not configured.');
  const { data, error } = await supabase.rpc('pmp_submit_mock_exam_session', { p_session_id: sessionId, p_answers: answers });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { score: Number(result?.score || 0), total: Number(result?.total || 180), attemptId: result?.attempt_id, review: Array.isArray(result?.review) ? result.review : [], expired: Boolean(result?.expired) };
}

function normaliseOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return options.split(/\n|\|/).map((option) => option.trim()).filter(Boolean);
    }
  }
  return [];
}

export async function getFlashcards(limit = 1000) {
  if (!supabase) return flashcards;
  const { data, error } = await supabase.rpc('pmp_get_flashcards', { p_limit: Math.min(Math.max(limit, 1), 1000) });
  if (error) throw error;
  return (data || []).map((card) => ({
    id: card.id,
    domain: formatFlashcardDomain(card.domain),
    front: card.front,
    back: card.back
  }));
}

function formatFlashcardDomain(domain) {
  if (domain === 'business_environment' || domain === 'business') return 'Business Environment';
  if (domain === 'people') return 'People';
  if (domain === 'process') return 'Process';
  return domain || 'PMP';
}
