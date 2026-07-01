import React, { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';

/**
 * Settings page allows users to configure preferences. In this stub we
 * demonstrate toggles for notifications, theme, and study reminders.
 */
function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [studyReminders, setStudyReminders] = useState(true);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Customize your experience" />
      <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Enable notifications</span>
          <input type="checkbox" checked={notifications} onChange={() => setNotifications((v) => !v)} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dark mode</span>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode((v) => !v)} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Study reminders</span>
          <input type="checkbox" checked={studyReminders} onChange={() => setStudyReminders((v) => !v)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Password</span>
          <input type="password" placeholder="Change password" style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Privacy</span>
          <select style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
            <option value="public">Public</option>
            <option value="friends">Friends only</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default Settings;