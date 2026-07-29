import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import AdminCard from '../components/AdminCard.jsx';
import { getAdminOverview, getReviewQueue, setQuestionReview, setLearnerTier, revokeBetaAccess } from '../services/adminService.js';

function Admin() {
  const [overview, setOverview] = useState(null);
  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [tier, setTier] = useState('trial');
  const [expiresAt, setExpiresAt] = useState('');

  const load = async () => {
    setError('');
    try {
      const [nextOverview, nextQueue] = await Promise.all([getAdminOverview(), getReviewQueue()]);
      setOverview(nextOverview); setQueue(nextQueue);
    } catch { setError('The admin data could not be loaded. Confirm that your account has the administrator role.'); }
  };
  useEffect(() => { load(); }, []);
  const review = async (questionId, status, publish) => {
    setMessage(''); setError('');
    try { await setQuestionReview(questionId, status, publish); setMessage('Question review updated.'); await load(); }
    catch { setError('The review update could not be saved.'); }
  };
  const invite = async (event) => {
    event.preventDefault(); setMessage(''); setError('');
    try {
      await setLearnerTier(inviteEmail, tier, expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null);
      setMessage(`${tier[0].toUpperCase()}${tier.slice(1)} plan saved. The learner can now sign in with that tier.`);
      await load();
    } catch (inviteError) { setError(inviteError.message || 'The learner must register before a plan can be assigned.'); }
  };
  const revoke = async () => {
    if (!inviteEmail) { setError('Enter the learner email before revoking access.'); return; }
    setMessage(''); setError('');
    try { await revokeBetaAccess(inviteEmail); setMessage('Beta access revoked.'); await load(); }
    catch (revokeError) { setError(revokeError.message || 'The learner access could not be revoked.'); }
  };
  return <div>
    <PageHeader title="Admin" subtitle="Private beta operations" />
    {error && <p role="alert" className="form-error">{error}</p>}
    {message && <p role="status" className="form-success">{message}</p>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
      <AdminCard title="Published questions" value={overview?.published_questions ?? '—'} />
      <AdminCard title="Awaiting review" value={overview?.awaiting_review ?? '—'} />
      <AdminCard title="Beta learners" value={overview?.beta_learners ?? '—'} />
      <AdminCard title="Mock attempts" value={overview?.completed_mock_attempts ?? '—'} />
    </div>
    <section style={{ marginBottom: '2rem', maxWidth: '42rem' }}><h3>Manage learner plan</h3><p style={{ color: 'var(--color-muted)' }}>The learner must register first. This changes access immediately; payments remain disabled during beta.</p>
      <form onSubmit={invite} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}><input required type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="learner@example.com" aria-label="Learner email" style={{ flex: '1 1 16rem', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '5px' }} /><select value={tier} onChange={(event) => setTier(event.target.value)} aria-label="Learner tier"><option value="trial">Trial — 7 days</option><option value="standard">Standard</option><option value="premium">Premium</option></select><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} aria-label="Plan expiry date" title="Optional expiry date" /><button type="submit">Save plan</button><button type="button" onClick={revoke}>Revoke access</button></form>
    </section>
    <section><h3>Question review queue</h3><p style={{ color: 'var(--color-muted)' }}>Approve only after checking the answer and explanation against the source material.</p>
      {!queue.length && !error && <p>No questions are waiting for review.</p>}
      {queue.map((question) => <article key={question.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)' }}>
        <p style={{ marginTop: 0, color: 'var(--color-muted)' }}>{question.domain?.replaceAll('_', ' ')} · confidence {Number(question.answer_confidence || 0).toFixed(2)}</p>
        <strong>{question.question_text}</strong>
        <ol type="A">{(Array.isArray(question.options) ? question.options : []).map((option, index) => <li key={index} style={{ fontWeight: index === Number(question.correct_index) ? 700 : 400 }}>{option}</li>)}</ol>
        <p><strong>Explanation:</strong> {question.explanation || 'None supplied'}</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => review(question.id, 'approved', true)}>Approve & publish</button>
          <button type="button" onClick={() => review(question.id, 'rejected', false)}>Reject</button>
        </div>
      </article>)}
    </section>
  </div>;
}

export default Admin;
