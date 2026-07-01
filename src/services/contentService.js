import { modules, flashcards, sampleQuestions } from '../data/mockData.js';

/**
 * Placeholder content service returning mock data. This layer abstracts data
 * retrieval and can later be extended to call REST or GraphQL APIs.
 */

export function getModules() {
  return Promise.resolve(modules);
}

export function getQuestions() {
  return Promise.resolve(sampleQuestions);
}

export function getFlashcards() {
  return Promise.resolve(flashcards);
}