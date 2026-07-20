import { modules, flashcards, sampleQuestions } from '../data/mockData.js';
import { supabase } from './supabaseClient.js';

/**
 * Placeholder content service returning mock data. This layer abstracts data
 * retrieval and can later be extended to call REST or GraphQL APIs.
 */

export function getModules() {
  return Promise.resolve(modules);
}

export function getQuestions() {
  if (!supabase) return Promise.resolve(sampleQuestions);

  return supabase
    .from('questions')
    .select('id, domain, prompt, options, correct_option_indices, explanation')
    .eq('published', true)
    .eq('review_status', 'approved')
    .order('id')
    .then(({ data, error }) => {
      if (error) throw error;
      return data.map((question) => ({
        id: question.id,
        text: question.prompt,
        options: question.options,
        correctIndex: question.correct_option_indices[0],
        correctIndices: question.correct_option_indices,
        explanation: question.explanation,
        domain: question.domain
      }));
    });
}

export function getFlashcards() {
  return Promise.resolve(flashcards);
}
