import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Primary navigation bar shown on marketing pages. Contains the brand
 * and simple navigation links. For a production build this could be
 * replaced with a more advanced responsive nav.
 */
function Navbar() {
  return (
    <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
          PMP&nbsp;LMS
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/pricing">Pricing</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;