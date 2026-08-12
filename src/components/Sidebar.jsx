import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService.js';

function Sidebar() {
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside style={{ width: '220px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '1rem' }}>
      <nav aria-label="Learning navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: isActive ? 'var(--color-primary)' : 'transparent', color: isActive ? '#fff' : 'inherit', textDecoration: 'none' })}>{link.label}</NavLink>
        ))}
      </nav>
      <button type="button" onClick={handleLogout} style={{ width: '100%', marginTop: '1rem', padding: '0.6rem 1rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>Sign out</button>
    </aside>
  );
}

export default Sidebar;
