import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logout } from '../services/authService.js';
import { BarChart3, BookOpen, Brain, CreditCard, FileQuestion, GraduationCap, LayoutDashboard, LogOut, Settings, Sparkles, UserRound } from 'lucide-react';
import { useEntitlement } from '../context/EntitlementContext.jsx';

/**
 * Sidebar for the dashboard. Uses NavLink to apply active styles. Adjust the
 * navigation list to match the full route structure of the LMS. The sidebar
 * collapses on smaller screens in a real implementation.
 */
function Sidebar() {
  const navigate = useNavigate();
  const { account } = useAuth();
  const { can, entitlement, loading } = useEntitlement();
  const [signingOut, setSigningOut] = useState(false);
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(can('modules') ? [{ to: '/modules', label: 'Modules', icon: BookOpen }] : []),
    ...(can('flashcards') ? [{ to: '/flashcards', label: 'Flashcards', icon: Brain }] : []),
    ...(can('questions') ? [{ to: '/questions', label: 'Question Bank', icon: FileQuestion }] : []),
    ...(can('practice') ? [{ to: '/quiz', label: 'Practice Quiz', icon: Sparkles }] : []),
    ...(can('mockExam') ? [{ to: '/mock-exam', label: 'Mock Exam', icon: GraduationCap }] : []),
    ...(can('analytics') ? [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }] : []),
    ...(can('certificates') ? [{ to: '/certificates', label: 'Certificates', icon: CreditCard }] : []),
    { to: '/profile', label: 'Profile', icon: UserRound },
    { to: '/settings', label: 'Settings', icon: Settings },
    ...(account?.profile?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Settings }] : [])
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
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">P</span>PMP Compass</div>
      {!loading && <p className="nav-label" style={{ marginTop: '1rem' }}>{entitlement.tier === 'none' ? 'No active plan' : `${entitlement.tier} plan`}</p>}
      <p className="nav-label">Learning space</p>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={17} strokeWidth={2.1} />{link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom"><button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="signout-button"
      >
        <LogOut size={17} />{signingOut ? 'Signing out…' : 'Sign out'}
      </button></div>
    </aside>
  );
}

export default Sidebar;
