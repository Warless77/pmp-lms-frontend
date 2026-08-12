import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getQuestions } from '../services/contentService.js';

function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestions(100).then(setQuestions).catch((err) => setError(err?.message || 'Unable to load questions.')).finally(() => setLoading(false));
  }, []);

  const filtered = questions.filter((q) => (q.question_text || '').toLowerCase().includes(query.toLowerCase()) || (q.domain || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Question Bank" subtitle="Browse and practise PMP exam questions" />
      <div style={{ marginBottom: '1rem' }}><input type="search" aria-label="Search questions" placeholder="Search questions or domains…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px' }} /></div>
      {loading && <p>Loading questions…</p>}
      {error && <p role="alert" style={{ color: 'var(--color-danger, #b42318)' }}>{error}</p>}
      {!loading && !error && <p style={{ color: 'var(--color-muted)' }}>Showing {filtered.length} of {questions.length} loaded questions.</p>}
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {filtered.map((q) => (
          <li key={q.id} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 600 }}>{q.question_text}</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Domain: {q.domain || '—'}</p>
            <button type="button" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>Attempt</button>
          </li>
        ))}
        {!loading && !error && filtered.length === 0 && <li>No questions found.</li>}
      </ul>
    </div>
  );
}

export default QuestionBank;
