import { supabase } from '../lib/supabase.js';

async function callAdmin(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data;
}

export async function getAdminOverview() { const data = await callAdmin('pmp_admin_overview'); return Array.isArray(data) ? data[0] : data; }
export async function getReviewQueue() { return (await callAdmin('pmp_admin_review_queue', { p_limit: 10 })) || []; }
export async function setQuestionReview(questionId, status, publish = false) { await callAdmin('pmp_admin_set_question_review', { p_question_id: questionId, p_status: status, p_publish: publish }); }
export async function setLearnerTier(email, tier, expiresAt = null, reason = '') { await callAdmin('pmp_admin_change_learner_tier', { p_email: email, p_tier: tier, p_expires_at: expiresAt, p_reason: reason }); }
export async function getLearnerEntitlements() { return (await callAdmin('pmp_admin_list_learner_entitlements', { p_limit: 100 })) || []; }
export async function revokeBetaAccess(email) { await callAdmin('pmp_admin_revoke_beta_access', { p_email: email }); }
