import { modules, flashcards, sampleQuestions } from '../data/mockData.js';
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
  if (!supabase) return Promise.resolve(sampleQuestions);

  return supabase
    .from('questions')
    .select('id, domain, question_text, options, correct_index, explanation')
    .eq('is_published', true)
    .eq('review_status', 'approved')
    .order('id')
    .then(({ data, error }) => {
      if (error) throw error;
      return data.map((question) => ({
        id: question.id,
        text: question.question_text,
        options: normaliseOptions(question.options),
        correctIndex: Number(question.correct_index),
        correctIndices: [question.correct_index],
        explanation: question.explanation,
        domain: question.domain
      }));
    });
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
