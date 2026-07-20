import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { getQuestions } from '../services/contentService.js';

/**
 * QuestionBank page provides a searchable list of practice questions. Filter
 * functionality is simplified here; real filters would include domains,
 * difficulty and other tags.
 */
function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestions().then(setQuestions).catch(() => {
      setError('The question bank is not available yet. Please ask an administrator to complete the question import.');
    });
  }, []);

  const filtered = questions.filter((q) => q.text.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Question Bank" subtitle={questions.length ? `${questions.length} approved practice questions` : 'Browse and practice exam questions'} />
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
        />
      </div>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {filtered.map((q) => (
          <li key={q.id} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 600 }}>{q.text}</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Domain: {(q.domain || 'general_pmp').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</p>
            <button
              type="button"
              onClick={() => navigate('/quiz')}
              style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Attempt
            </button>
          </li>
        ))}
        {filtered.length === 0 && <li>No questions found.</li>}
      </ul>
    </div>
  );
}

export default QuestionBank;
