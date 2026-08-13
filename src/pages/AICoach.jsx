import React, { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { askAICoach } from '../services/aiCoachService.js';

const starterPrompts = [
  'Explain the difference between risk and issue management.',
  'Help me understand servant leadership for the PMP exam.',
  'Give me a scenario-based question about stakeholder engagement.',
];

function AICoach() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const context = useMemo(() => {
    const recent = messages.slice(-6);
    return recent.map((item) => `${item.role === 'user' ? 'Learner' : 'Coach'}: ${item.text}`).join('\n');
  }, [messages]);

  const submit = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || loading) return;

    setError('');
    setMessages((items) => [...items, { role: 'user', text: question }]);
    setMessage('');
    setLoading(true);
    try {
      const answer = await askAICoach(question, context);
      setMessages((items) => [...items, { role: 'assistant', text: answer }]);
    } catch (err) {
      setError(err.message || 'AI Coach is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="AI Coach" subtitle="PMP-focused guidance, explanations and scenario practice" />

      <div className="dashboard-grid">
        <section className="surface-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
            <div>
              <span className="page-eyebrow">PMP Compass AI</span>
              <h2 style={{ margin: '.25rem 0' }}>Ask your AI Coach</h2>
              <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>Use it to understand concepts, analyse scenarios and build an exam strategy.</p>
            </div>
            <span className="surface-card" style={{ padding: '.45rem .7rem', whiteSpace: 'nowrap' }}>AI Coach</span>
          </div>

          <div style={{ display: 'grid', gap: '.75rem', margin: '1rem 0' }}>
            {messages.length === 0 && (
              <div style={{ padding: '1rem', border: '1px dashed var(--color-border)', borderRadius: '10px' }}>
                <strong>Start with a prompt</strong>
                <div style={{ display: 'grid', gap: '.5rem', marginTop: '.75rem' }}>
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} type="button" className="button-secondary" style={{ textAlign: 'left' }} onClick={() => setMessage(prompt)}>{prompt}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: item.role === 'user' ? 'var(--color-surface)' : 'transparent' }}>
                <strong>{item.role === 'user' ? 'You' : 'AI Coach'}</strong>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{item.text}</p>
              </div>
            ))}
            {loading && <div style={{ color: 'var(--color-muted)' }}>AI Coach is thinking…</div>}
            {error && <div role="alert" style={{ color: 'var(--color-error)' }}>{error}</div>}
          </div>

          <form onSubmit={submit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask a PMP question…"
              maxLength={4000}
              rows={4}
              disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', marginTop: '.75rem' }}>
              <small style={{ color: 'var(--color-muted)' }}>{message.length}/4000</small>
              <button className="button-primary" type="submit" disabled={loading || !message.trim()}>{loading ? 'Thinking…' : 'Ask AI Coach'}</button>
            </div>
          </form>
        </section>

        <aside>
          <section className="surface-card" style={{ padding: '1.15rem' }}>
            <h3 className="section-heading">Use AI effectively</h3>
            <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.7 }}>
              <li>Ask for explanations rather than memorised answers.</li>
              <li>Request scenario-based reasoning.</li>
              <li>Ask the coach to identify gaps in your understanding.</li>
              <li>Verify important exam information against your approved study materials.</li>
            </ul>
            <small style={{ color: 'var(--color-muted)' }}>AI Coach does not reproduce official PMI exam questions.</small>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default AICoach;
