/**
 * Helper functions used throughout the application. Keeping them in a
 * central module avoids duplication and improves testability.
 */

/**
 * Format a date string into a more human‑friendly format. Expects an ISO date
 * string and returns something like "1 Jul 2026". When the input is
 * undefined, returns an empty string.
 * @param {string} isoDate
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}