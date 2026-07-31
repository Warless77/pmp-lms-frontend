import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [app, contentService, migration, mockSessionMigration, tierMigration, tierHardeningMigration, tierOperationsMigration, adminService, adminPage, mockExam, entitlementContext, gate, vercel] = await Promise.all([
  read('src/App.jsx'), read('src/services/contentService.js'),
  read('supabase/migrations/20260721_private_beta_launch_foundation.sql'),
  read('supabase/migrations/20260728_reliable_mock_exam_sessions.sql'),
  read('supabase/migrations/20260729_enforced_learner_tiers.sql'), read('supabase/migrations/20260801_harden_learner_tier_control.sql'), read('supabase/migrations/20260801_tier_control_operations.sql'), read('src/services/adminService.js'), read('src/pages/Admin.jsx'),
  read('src/pages/MockExam.jsx'), read('src/context/EntitlementContext.jsx'), read('src/components/EntitlementGate.jsx'), read('vercel.json')
]);

assert.match(app, /path="mock-exams" element={<EntitlementGate feature="mockExam"><MockExam/);
assert.match(app, /path="mock-exam" element={<EntitlementGate feature="mockExam"><MockExam/);
assert.match(app, /path="questions" element={<EntitlementGate feature="questions"><QuestionBank/);
assert.match(app, /path="analytics" element={<EntitlementGate feature="analytics"><Analytics/);
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
assert.match(tierHardeningMigration, /modules_enabled boolean/);
assert.match(tierHardeningMigration, /analytics_enabled boolean/);
assert.match(tierHardeningMigration, /certificates_enabled boolean/);
assert.match(tierHardeningMigration, /pmp_current_tier\(\) <> 'premium'/);
assert.match(tierOperationsMigration, /pmp_entitlement_events/);
assert.match(tierOperationsMigration, /pmp_admin_change_learner_tier/);
assert.match(tierOperationsMigration, /pmp_admin_list_learner_entitlements/);
assert.match(tierOperationsMigration, /An administrator cannot revoke their own access/);
assert.match(adminService, /pmp_admin_change_learner_tier/);
assert.match(adminPage, /Learner access register/);
assert.match(entitlementContext, /getLearnerEntitlement/);
assert.match(gate, /Upgrade your learning access/);
assert.match(vercel, /"rewrites"/);
console.log('Launch smoke checks passed.');
