import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { getQuestions } from '../services/contentService.js';

const titleCaseDomain = (domain) => (domain || 'general_pmp').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestions().then(setQuestions).catch(() => setError('The question bank could not be loaded. Please try again shortly.'));
  }, []);

  const domains = useMemo(() => [...new Set(questions.map((item) => item.domain).filter(Boolean))], [questions]);
  const filtered = questions.filter((question) =>
    (domain === 'all' || question.domain === domain) && question.text.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Question Bank" subtitle={questions.length ? `${questions.length} approved practice questions` : 'Loading your practice questions'} />
      {error && <p role="alert" className="form-error">{error}</p>}
      {!error && <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input type="search" aria-label="Search questions" placeholder="Search questions…" value={query} onChange={(event) => setQuery(event.target.value)} style={{ flex: '1 1 18rem', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px' }} />
        <select aria-label="Filter by domain" value={domain} onChange={(event) => setDomain(event.target.value)} style={{ padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
          <option value="all">All domains</option>
          {domains.map((item) => <option key={item} value={item}>{titleCaseDomain(item)}</option>)}
        </select>
      </div>}
      {!error && !questions.length && <p>Loading approved questions…</p>}
      <p style={{ color: 'var(--color-muted)' }}>{filtered.length} question{filtered.length === 1 ? '' : 's'} available</p>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {filtered.map((question) => (
          <li key={question.id} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 600, marginTop: 0 }}>{question.text}</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Domain: {titleCaseDomain(question.domain)}</p>
            <button type="button" onClick={() => navigate('/quiz', { state: { questionId: question.id } })} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Attempt this question</button>
          </li>
        ))}
        {questions.length > 0 && filtered.length === 0 && <li>No questions match your search.</li>}
      </ul>
    </div>
  );
}

export default QuestionBank;
