import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService.js';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Unable to send the password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '440px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Reset your password</h2>
      <p>Enter the email address associated with your PMP LMS account. We will send you a secure password reset link.</p>
      {sent ? (
        <div role="status" aria-live="polite" style={{ padding: '1rem', background: '#ecfdf3', color: '#067647', borderRadius: '6px' }}>
          If an account exists for that email address, a password reset link has been sent. Check your inbox and junk folder.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="reset-email">Email</label>
            <input id="reset-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', padding: '0.65rem', border: '1px solid var(--color-border, #d0d5dd)', borderRadius: '4px' }} />
          </div>
          {error && <p role="alert" style={{ color: 'var(--color-danger, #b42318)' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary, #2563eb)', color: '#fff', border: 0, borderRadius: '4px', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <p style={{ marginTop: '1.25rem' }}><Link to="/login">Back to sign in</Link></p>
    </main>
  );
}

export default ForgotPassword;
