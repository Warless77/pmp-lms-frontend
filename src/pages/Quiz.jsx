import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { getQuestions } from '../services/contentService.js';
import { recordAnswer } from '../services/learnerProgressService.js';

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestions().then((items) => {
      const requested = location.state?.questionId;
      if (requested) {
        const found = items.findIndex((item) => String(item.id) === String(requested));
        if (found >= 0) setIndex(found);
      }
      setQuestions(items);
    }).catch(() => setError('The quiz could not be loaded. Please try again shortly.'));
  }, [location.state]);

  if (error) return <p role="alert" className="form-error">{error}</p>;
  if (!questions.length) return <p>Loading quiz…</p>;
  const question = questions[index];

  const select = (optionIndex) => {
    if (selected !== null) return;
    const isCorrect = optionIndex === question.correctIndex;
    setSelected(optionIndex);
    if (isCorrect) setScore((value) => value + 1);
    recordAnswer(question.id, isCorrect);
  };
  const next = () => {
    if (index + 1 === questions.length) setComplete(true);
    else { setIndex((value) => value + 1); setSelected(null); }
  };
  const restart = () => { setIndex(0); setSelected(null); setScore(0); setComplete(false); navigate('/quiz', { replace: true }); };

  if (complete) return (
    <div><PageHeader title="Quiz complete" subtitle="Your practice result" />
      <div style={{ maxWidth: '38rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)' }}>
        <h2>{score} / {questions.length}</h2><p>You can revisit explanations at any time by retaking the quiz.</p>
        <button type="button" onClick={restart} style={{ padding: '0.65rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>Practise again</button>
      </div></div>
  );

  return (
    <div><PageHeader title="Quiz" subtitle={`Question ${index + 1} of ${questions.length}`} />
      <div style={{ maxWidth: '46rem', margin: '0 auto' }}>
        <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)' }}>
          <p style={{ color: 'var(--color-muted)' }}>Score so far: {score}</p><h3>{question.text}</h3>
          <div style={{ display: 'grid', gap: '0.6rem' }}>{question.options.map((option, optionIndex) => {
            const reviewed = selected !== null;
            const correct = optionIndex === question.correctIndex;
            const chosen = optionIndex === selected;
            const background = !reviewed ? 'var(--color-surface)' : correct ? '#dcfce7' : chosen ? '#fee2e2' : 'var(--color-surface)';
            return <button key={optionIndex} type="button" onClick={() => select(optionIndex)} disabled={reviewed} style={{ textAlign: 'left', padding: '0.8rem 1rem', border: `1px solid ${chosen ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', background, cursor: reviewed ? 'default' : 'pointer' }}>{String.fromCharCode(65 + optionIndex)}. {option}</button>;
          })}</div>
          {selected !== null && <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '6px' }}><strong>{selected === question.correctIndex ? 'Correct.' : 'Not quite.'}</strong><p style={{ marginBottom: 0 }}>{question.explanation || 'No explanation has been provided for this question.'}</p></div>}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><button type="button" onClick={() => navigate('/questions')} style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '5px', cursor: 'pointer' }}>Question bank</button><button type="button" onClick={next} disabled={selected === null} style={{ padding: '0.6rem 1rem', background: selected === null ? 'var(--color-border)' : 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: selected === null ? 'not-allowed' : 'pointer' }}>{index + 1 === questions.length ? 'Finish quiz' : 'Next question'}</button></div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
