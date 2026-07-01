/**
 * Placeholder payment service for subscription handling. Real Stripe or other
 * payment integrations should replace these stubs.
 */

export function createCheckoutSession(plan) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ sessionId: 'demo-session', plan });
    }, 500);
  });
}

export function getSubscription() {
  return Promise.resolve({ plan: 'trial', status: 'active' });
}