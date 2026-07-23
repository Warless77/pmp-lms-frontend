import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logout } from '../services/authService.js';

/**
 * Sidebar for the dashboard. Uses NavLink to apply active styles. Adjust the
 * navigation list to match the full route structure of the LMS. The sidebar
 * collapses on smaller screens in a real implementation.
 */
function Sidebar() {
  const navigate = useNavigate();
  const { account } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/modules', label: 'Modules' },
    { to: '/flashcards', label: 'Flashcards' },
    { to: '/questions', label: 'Question Bank' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/mock-exam', label: 'Mock Exams' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/profile', label: 'Profile' },
    { to: '/settings', label: 'Settings' },
    ...(account?.profile?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : [])
  ];

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside style={{ width: '220px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '1rem' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? '#fff' : 'inherit',
              textDecoration: 'none'
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        style={{ width: '100%', marginTop: '2rem', padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'transparent', cursor: signingOut ? 'wait' : 'pointer' }}
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </aside>
  );
}

export default Sidebar;
