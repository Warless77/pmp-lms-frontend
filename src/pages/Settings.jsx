import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getCloudLearnerProgress, saveCloudSettings } from '../services/learnerProgressService.js';
import { getCurrentUser, requestPasswordReset } from '../services/authService.js';

function Settings() {
  const [settings, setSettings] = useState({ notifications: true, darkMode: false, studyReminders: true });
  const [message, setMessage] = useState('');
  useEffect(() => { getCloudLearnerProgress().then((progress) => setSettings(progress.settings)).catch(() => {}); }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark-theme', settings.darkMode); }, [settings.darkMode]);
  const update = async (key, value) => { const next = { ...settings, [key]: value }; setSettings(next); try { await saveCloudSettings(next); } catch { setMessage('Your setting could not be saved. Please try again.'); } };
  const resetPassword = async () => {
    setMessage('');
    try { const account = await getCurrentUser(); await requestPasswordReset(account.user.email); setMessage('Password reset instructions have been sent to your email.'); }
    catch { setMessage('We could not send a reset email. Please try again after signing in again.'); }
  };
  return <div><PageHeader title="Settings" subtitle="Customize your private beta experience" /><div style={{ maxWidth: '32rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {[['notifications', 'Enable notifications'], ['darkMode', 'Dark mode'], ['studyReminders', 'Study reminders']].map(([key, label]) => <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>{label}</span><input type="checkbox" checked={settings[key]} onChange={(event) => update(key, event.target.checked)} /></label>)}
    <button type="button" onClick={resetPassword} style={{ width: 'fit-content', padding: '0.6rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '5px', cursor: 'pointer' }}>Send password reset email</button>{message && <p role="status" className="form-success">{message}</p>}
  </div></div>;
}

export default Settings;
