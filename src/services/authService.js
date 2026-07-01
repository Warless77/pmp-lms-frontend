/**
 * Placeholder authentication service. Replace the stubbed implementations with
 * real API calls once authentication back‑end is available.
 */

export function login({ email, password }) {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve({ user: { id: 1, name: 'Demo User', email }, token: 'demo-token' });
    }, 500);
  });
}

export function register({ name, email, password, targetDate, plan }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ user: { id: 2, name, email }, token: 'demo-token' });
    }, 500);
  });
}

export function logout() {
  return Promise.resolve();
}

export function getCurrentUser() {
  return Promise.resolve({ user: { id: 1, name: 'Demo User', email: 'demo@pmplms.com' } });
}