import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [app, contentService, migration, vercel] = await Promise.all([
  read('src/App.jsx'), read('src/services/contentService.js'),
  read('supabase/migrations/20260721_private_beta_launch_foundation.sql'), read('vercel.json')
]);

assert.match(app, /path="mock-exams" element={<MockExam/);
assert.match(app, /path="mock-exam" element={<MockExam/);
assert.match(contentService, /pmp_get_learner_questions/);
assert.doesNotMatch(contentService, /select\('id, domain, question_text, options, correct_index/);
assert.match(contentService, /pmp_grade_practice_answer/);
assert.match(contentService, /pmp_submit_mock_attempt/);
assert.match(migration, /pmp_beta_entitlements/);
assert.match(migration, /pmp_question_responses/);
assert.match(migration, /pmp_admin_grant_beta_access/);
assert.match(migration, /pmp_admin_revoke_beta_access/);
assert.match(vercel, /"rewrites"/);
console.log('Launch smoke checks passed.');
