import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService.js';

/**
 * Login page. This version does not perform real authentication; it
 * simulates a login and redirects to the dashboard on submit.
 */
function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Login</h2>
      <p>Private beta access for invited PMP learners.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        {error && <p role="alert" className="form-error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
