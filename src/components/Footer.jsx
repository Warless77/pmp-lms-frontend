import React from 'react';

/**
 * Simple footer used on marketing pages. Lists a few useful links and
 * copyright information. Styling should be adapted as the design evolves.
 */
function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '2rem', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} PMP LMS. All rights reserved.</p>
    </footer>
  );
}

export default Footer;