import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';
import { getQuestions, submitMockAttempt } from '../services/contentService.js';

const BETA_DURATION_SECONDS = 60 * 60;

function MockExam() {
  const [phase, setPhase] = useState('welcome');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(BETA_DURATION_SECONDS);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getQuestions().then(setQuestions).catch(() => setError('The approved question bank could not be loaded.')); }, []);
  useEffect(() => {
    if (phase !== 'exam') return undefined;
    const timer = window.setInterval(() => setSecondsRemaining((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const finish = async (timeExpired = false) => {
    if (phase !== 'exam' || submitting) return;
    if (!Object.keys(answers).length) {
      setError(timeExpired ? 'Time is up. Select at least one answer before your result can be saved.' : 'Select at least one answer before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const submission = Object.fromEntries(Object.entries(answers).map(([index, answer]) => [questions[Number(index)].id, answer]));
      setResult(await submitMockAttempt(submission, BETA_DURATION_SECONDS - secondsRemaining));
      setPhase('results');
    } catch { setError('We could not submit this exam. Please try again.'); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    if (phase === 'exam' && secondsRemaining === 0) finish(true);
  }, [secondsRemaining, phase]);

  const reset = () => { setPhase('welcome'); setCurrent(0); setAnswers({}); setResult(null); setSecondsRemaining(BETA_DURATION_SECONDS); setError(''); };

  if (error && phase !== 'exam') return <p role="alert" className="form-error">{error}</p>;
  if (!questions.length) return <p>Loading approved questions…</p>;
  if (phase === 'welcome') return <div><PageHeader title="Mock Exam" subtitle="Timed PMP practice" /><div style={{ maxWidth: '42rem', padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}><h2>Private beta mock exam</h2><p>This exam contains {questions.length} approved questions and a 60-minute timer. Your responses remain editable until you submit.</p><button type="button" onClick={() => setPhase('exam')} style={{ padding: '0.75rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>Start exam</button></div></div>;
  if (phase === 'results') return <div><PageHeader title="Mock exam complete" subtitle="Your private beta result" /><div style={{ maxWidth: '52rem', padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}><h2>{result?.score || 0} / {result?.total || 0}</h2><p>Your result is securely saved to your learner account. Review is available only after submission.</p>
    <section aria-label="Answer review">{(result?.review || []).map((item, index) => { const question = questions.find((q) => q.id === item.question_id); const selected = answers[questions.findIndex((q) => q.id === item.question_id)]; return <article key={item.question_id} style={{ marginTop: '1rem', padding: '1rem', border: `1px solid ${item.is_correct ? '#16a34a' : '#dc2626'}`, borderRadius: '6px' }}><strong>Question {index + 1}: {item.is_correct ? 'Correct' : 'Incorrect'}</strong><p>{question?.text}</p><p>Your answer: {selected === undefined ? 'Not answered' : `${String.fromCharCode(65 + selected)}. ${question?.options?.[selected] || ''}`}</p><p>Correct answer: {String.fromCharCode(65 + item.correct_index)}. {question?.options?.[item.correct_index] || ''}</p>{item.explanation && <p><strong>Explanation:</strong> {item.explanation}</p>}</article>; })}</section>
    <button type="button" onClick={reset} style={{ marginTop: '1rem', padding: '0.7rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 0, borderRadius: '5px', cursor: 'pointer' }}>Start a new attempt</button></div></div>;

  const question = questions[current];
  return <div><PageHeader title="Mock Exam" subtitle={`Question ${current + 1} of ${questions.length}`} />
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}><ExamTimer minutes={Math.floor(secondsRemaining / 60)} seconds={secondsRemaining % 60} /><span>{Object.keys(answers).length} answered</span><button type="button" disabled={submitting} onClick={() => finish(false)} style={{ padding: '0.55rem 1rem', background: 'var(--color-error)', color: '#fff', border: 0, borderRadius: '5px', cursor: submitting ? 'wait' : 'pointer' }}>{submitting ? 'Submitting…' : 'Submit exam'}</button></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <QuestionNavigator total={questions.length} current={current} answered={Object.keys(answers).map(Number)} onSelect={setCurrent} />
    <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}><h3>{question.text}</h3><div style={{ display: 'grid', gap: '0.6rem' }}>{question.options.map((option, optionIndex) => {
      const isSelected = answers[current] === optionIndex;
      return <button key={optionIndex} type="button" aria-pressed={isSelected} onClick={() => setAnswers((old) => ({ ...old, [current]: optionIndex }))} style={{ textAlign: 'left', padding: '0.8rem 1rem', border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isSelected ? '#dbeafe' : 'var(--color-surface)', color: isSelected ? '#0f172a' : 'var(--color-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: isSelected ? 600 : 400 }}>{String.fromCharCode(65 + optionIndex)}. {option}</button>;
    })}</div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}><button type="button" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} style={{ padding: '0.55rem 1rem' }}>Previous</button><button type="button" disabled={current === questions.length - 1} onClick={() => setCurrent((value) => value + 1)} style={{ padding: '0.55rem 1rem' }}>Next</button></div></div>
  </div>;
}

export default MockExam;
