import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../services/authService.js';

/**
 * Registration page. Collects basic user information and simulates creating
 * an account. After successful registration it redirects to the dashboard.
 */
function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', targetDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await registerUser(form);
      if (result.session) navigate('/dashboard');
      else setMessage('Check your email to confirm your private beta account.');
    } catch (err) {
      setError(err.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '2rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
        </div>
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
        <div>
          <label htmlFor="targetDate">Target Exam Date</label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            required
            value={form.targetDate}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Registering…' : 'Register'}
        </button>
        {error && <p role="alert" className="form-error">{error}</p>}
        {message && <p role="status" className="form-success">{message}</p>}
      </form>
    </div>
  );
}

export default Register;
