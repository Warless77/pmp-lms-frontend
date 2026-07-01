import React from 'react';

/**
 * Fallback page shown when no matching route exists. Provides a simple
 * message and a link back to the home page.
 */
function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Page Not Found</h2>
      <p>The page you requested could not be found.</p>
      <a href="/" style={{ color: 'var(--color-primary)' }}>Return home</a>
    </div>
  );
}

export default NotFound;