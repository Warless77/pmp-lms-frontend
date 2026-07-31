import { requireSupabase } from './supabaseClient.js';

export async function getAdminOverview() {
  const { data, error } = await requireSupabase().rpc('pmp_admin_overview');
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getReviewQueue() {
  const { data, error } = await requireSupabase().rpc('pmp_admin_review_queue', { p_limit: 10 });
  if (error) throw error;
  return data || [];
}

export async function setQuestionReview(questionId, status, publish = false) {
  const { error } = await requireSupabase().rpc('pmp_admin_set_question_review', {
    p_question_id: questionId,
    p_status: status,
    p_publish: publish
  });
  if (error) throw error;
}

export async function setLearnerTier(email, tier, expiresAt = null, reason = '') {
  const { error } = await requireSupabase().rpc('pmp_admin_change_learner_tier', {
    p_email: email,
    p_tier: tier,
    p_expires_at: expiresAt,
    p_reason: reason
  });
  if (error) throw error;
}

export async function getLearnerEntitlements() {
  const { data, error } = await requireSupabase().rpc('pmp_admin_list_learner_entitlements', { p_limit: 100 });
  if (error) throw error;
  return data || [];
}

export async function revokeBetaAccess(email) {
  const { error } = await requireSupabase().rpc('pmp_admin_revoke_beta_access', { p_email: email });
  if (error) throw error;
}
