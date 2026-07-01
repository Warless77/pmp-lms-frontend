import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar for the dashboard. Uses NavLink to apply active styles. Adjust the
 * navigation list to match the full route structure of the LMS. The sidebar
 * collapses on smaller screens in a real implementation.
 */
function Sidebar() {
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
    { to: '/admin', label: 'Admin' }
  ];

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
    </aside>
  );
}

export default Sidebar;