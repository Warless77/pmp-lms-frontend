import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [app, contentService, migration, mockSessionMigration, tierMigration, adminService, mockExam, vercel] = await Promise.all([
  read('src/App.jsx'), read('src/services/contentService.js'),
  read('supabase/migrations/20260721_private_beta_launch_foundation.sql'),
  read('supabase/migrations/20260728_reliable_mock_exam_sessions.sql'),
  read('supabase/migrations/20260729_enforced_learner_tiers.sql'), read('src/services/adminService.js'),
  read('src/pages/MockExam.jsx'), read('vercel.json')
]);

assert.match(app, /path="mock-exams" element={<MockExam/);
assert.match(app, /path="mock-exam" element={<MockExam/);
assert.match(contentService, /pmp_get_learner_questions/);
assert.doesNotMatch(contentService, /select\('id, domain, question_text, options, correct_index/);
assert.match(contentService, /pmp_grade_practice_answer/);
assert.match(contentService, /pmp_submit_mock_attempt/);
assert.match(contentService, /pmp_start_mock_exam/);
assert.match(contentService, /pmp_submit_mock_exam_session/);
assert.match(mockSessionMigration, /pmp_mock_exam_sessions/);
assert.match(mockSessionMigration, /pmp_mock_exam_session_questions/);
assert.match(mockSessionMigration, /pmp_get_practice_questions/);
assert.match(mockExam, /PMP_DURATION_SECONDS = 230 \* 60/);
assert.match(mockExam, /submitMockExamSession/);
assert.match(migration, /pmp_beta_entitlements/);
assert.match(migration, /pmp_question_responses/);
assert.match(migration, /pmp_admin_grant_beta_access/);
assert.match(migration, /pmp_admin_revoke_beta_access/);
assert.match(tierMigration, /pmp_admin_set_learner_tier/);
assert.match(tierMigration, /access_level in \('trial', 'standard', 'premium'\)/);
assert.match(tierMigration, /Mock Exams are available with Premium/);
assert.match(tierMigration, /Your 25 Trial practice questions are complete/);
assert.match(adminService, /pmp_admin_set_learner_tier/);
assert.match(vercel, /"rewrites"/);
console.log('Launch smoke checks passed.');
