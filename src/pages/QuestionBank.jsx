import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getQuestions } from '../services/contentService.js';

/**
 * QuestionBank page provides a searchable list of practice questions. Filter
 * functionality is simplified here; real filters would include domains,
 * difficulty and other tags.
 */
function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getQuestions().then(setQuestions);
  }, []);

  const filtered = questions.filter((q) => q.text.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Question Bank" subtitle="Browse and practice exam questions" />
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
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Topic: N/A • Difficulty: N/A • Domain: N/A</p>
            <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>
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