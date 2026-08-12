import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../services/authService.js';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', targetDate: '', plan: 'trial' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const result = await registerUser(form);
      if (result.session) navigate('/dashboard', { replace: true });
      else setMessage('Account created. Check your email to confirm your account, then sign in.');
    } catch (err) {
      setError(err?.message || 'Unable to create your account.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '2rem auto' }}>
      <h2>Create your PMP LMS account</h2>
      {error && <p role="alert" style={{ color: 'var(--color-danger, #b42318)' }}>{error}</p>}
      {message && <p role="status" style={{ color: 'var(--color-success, #067647)' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div><label htmlFor="name">Full Name</label><input id="name" name="name" type="text" autoComplete="name" required value={form.name} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} /></div>
        <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} /></div>
        <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} /></div>
        <div><label htmlFor="targetDate">Target Exam Date</label><input id="targetDate" name="targetDate" type="date" required value={form.targetDate} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} /></div>
        <div><label htmlFor="plan">Plan</label><select id="plan" name="plan" value={form.plan} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}><option value="trial">Trial</option><option value="standard">Standard</option><option value="premium">Premium</option></select></div>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
    </div>
  );
}

export default Register;
