import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';
import { getQuestions } from '../services/contentService.js';
import { recordAnswer, recordMockAttempt } from '../services/learnerProgressService.js';

const BETA_DURATION_SECONDS = 60 * 60;

function MockExam() {
  const [phase, setPhase] = useState('welcome');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(BETA_DURATION_SECONDS);
  const [error, setError] = useState('');

  useEffect(() => { getQuestions().then(setQuestions).catch(() => setError('The approved question bank could not be loaded.')); }, []);
  useEffect(() => {
    if (phase !== 'exam') return undefined;
    const timer = window.setInterval(() => setSecondsRemaining((time) => {
      if (time <= 1) { setPhase('results'); return 0; }
      return time - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const score = useMemo(() => Object.entries(answers).reduce((total, [index, answer]) => total + (questions[Number(index)]?.correctIndex === answer ? 1 : 0), 0), [answers, questions]);
  const finish = () => {
    if (phase !== 'exam') return;
    Object.entries(answers).forEach(([index, answer]) => recordAnswer(questions[Number(index)].id, questions[Number(index)].correctIndex === answer));
    recordMockAttempt({ score, total: questions.length, elapsedSeconds: BETA_DURATION_SECONDS - secondsRemaining });
    setPhase('results');
  };
  const reset = () => { setPhase('welcome'); setCurrent(0); setAnswers({}); setSecondsRemaining(BETA_DURATION_SECONDS); };

  if (error) return <p role="alert" className="form-error">{error}</p>;
  if (!questions.length) return <p>Loading approved questions…</p>;
  if (phase === 'welcome') return <div><PageHeader title="Mock Exam" subtitle="Timed PMP practice" /><div style={{ maxWidth: '42rem', padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}><h2>Private beta mock exam</h2><p>This exam contains {questions.length} approved questions and a 60-minute timer. Your responses remain editable until you submit.</p><button type="button" onClick={() => setPhase('exam')} style={{ padding: '0.75rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>Start exam</button></div></div>;
  if (phase === 'results') return <div><PageHeader title="Mock exam complete" subtitle="Your private beta result" /><div style={{ maxWidth: '42rem', padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}><h2>{score} / {questions.length}</h2><p>You answered {Object.keys(answers).length} question{Object.keys(answers).length === 1 ? '' : 's'} in this attempt.</p><p>Results are saved in this browser and update your dashboard analytics.</p><button type="button" onClick={reset} style={{ padding: '0.7rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>Start a new attempt</button></div></div>;

  const question = questions[current];
  return <div><PageHeader title="Mock Exam" subtitle={`Question ${current + 1} of ${questions.length}`} />
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}><ExamTimer minutes={Math.floor(secondsRemaining / 60)} seconds={secondsRemaining % 60} /><span>{Object.keys(answers).length} answered</span><button type="button" onClick={finish} style={{ padding: '0.55rem 1rem', background: 'var(--color-error)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>Submit exam</button></div>
    <QuestionNavigator total={questions.length} current={current} answered={Object.keys(answers).map(Number)} onSelect={setCurrent} />
    <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}><h3>{question.text}</h3><div style={{ display: 'grid', gap: '0.6rem' }}>{question.options.map((option, optionIndex) => {
      const isSelected = answers[current] === optionIndex;
      return <button key={optionIndex} type="button" aria-pressed={isSelected} onClick={() => setAnswers((old) => ({ ...old, [current]: optionIndex }))} style={{ textAlign: 'left', padding: '0.8rem 1rem', border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isSelected ? '#dbeafe' : 'var(--color-surface)', color: isSelected ? '#0f172a' : 'var(--color-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: isSelected ? 600 : 400 }}>{String.fromCharCode(65 + optionIndex)}. {option}</button>;
    })}</div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}><button type="button" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} style={{ padding: '0.55rem 1rem' }}>Previous</button><button type="button" disabled={current === questions.length - 1} onClick={() => setCurrent((value) => value + 1)} style={{ padding: '0.55rem 1rem' }}>Next</button></div></div>
  </div>;
}

export default MockExam;
