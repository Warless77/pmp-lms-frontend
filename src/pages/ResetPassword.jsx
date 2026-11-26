import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { updatePassword } from '../services/authService.js';

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      setReady(Boolean(data.session) && !sessionError);
      if (sessionError) setError('This password reset link is invalid or has expired. Request a new link.');
      setChecking(false);
    };
    checkRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' && session) {
        setReady(true);
        setChecking(false);
        setError('');
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      await supabase.auth.signOut();
    } catch (err) {
      setError(err?.message || 'Unable to update your password. Request a new reset link and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <main style={{ maxWidth: '440px', margin: '2rem auto', padding: '0 1rem' }}><p>Verifying your reset link…</p></main>;

  return (
    <main style={{ maxWidth: '440px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Choose a new password</h2>
      {success ? (
        <div role="status" aria-live="polite">
          <p>Your password has been updated. You can now sign in with your new password.</p>
          <button type="button" onClick={() => navigate('/login', { replace: true })} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary, #2563eb)', color: '#fff', border: 0, borderRadius: '4px' }}>Go to sign in</button>
        </div>
      ) : !ready ? (
        <>
          <p role="alert" style={{ color: 'var(--color-danger, #b42318)' }}>{error || 'This password reset link is invalid or has expired. Request a new link.'}</p>
          <Link to="/forgot-password">Request a new reset link</Link>
        </>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', padding: '0.65rem', border: '1px solid var(--color-border, #d0d5dd)', borderRadius: '4px' }} />
          </div>
          <div>
            <label htmlFor="confirm-password">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength="8" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', padding: '0.65rem', border: '1px solid var(--color-border, #d0d5dd)', borderRadius: '4px' }} />
          </div>
          {error && <p role="alert" style={{ color: 'var(--color-danger, #b42318)' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary, #2563eb)', color: '#fff', border: 0, borderRadius: '4px', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Updating…' : 'Update password'}</button>
        </form>
      )}
    </main>
  );
}

export default ResetPassword;
