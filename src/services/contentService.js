import { modules, flashcards } from '../data/mockData.js';
import { supabase } from './supabaseClient.js';
import { getLearnerProgress } from './learnerProgressService.js';

/**
 * Placeholder content service returning mock data. This layer abstracts data
 * retrieval and can later be extended to call REST or GraphQL APIs.
 */

export function getModules() {
  const { completedModules } = getLearnerProgress();
  return Promise.resolve(modules.map((module) => ({
    ...module,
    progress: completedModules.includes(module.id) ? 100 : 0
  })));
}

export function getQuestions() {
  if (!supabase) return Promise.reject(new Error('The private beta question service is not configured.'));

  return supabase
    .rpc('pmp_get_learner_questions', { p_limit: 180 })
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
  const { data, error } = await supabase.rpc('pmp_submit_mock_attempt', {
    p_answers: answers,
    p_elapsed_seconds: elapsedSeconds
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { score: Number(result?.score || 0), total: Number(result?.total || 0), attemptId: result?.attempt_id };
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

export function getFlashcards() {
  return Promise.resolve(flashcards);
}
