import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService.js';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Sign in</h2>
      {error && <p role="alert" style={{ color: 'var(--color-danger, #b42318)' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} /></div>
        <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} /></div>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

export default Login;
