import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';
import { startMockExam, submitMockExamSession } from '../services/contentService.js';

const PMP_DURATION_SECONDS = 230 * 60;

function MockExam() {
  const [phase, setPhase] = useState('welcome');
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(PMP_DURATION_SECONDS);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (phase !== 'exam') return undefined;
    const timer = window.setInterval(() => setSecondsRemaining((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const start = async () => {
    setError(''); setSubmitting(true);
    try {
      const session = await startMockExam(PMP_DURATION_SECONDS);
      setSessionId(session.sessionId); setQuestions(session.questions); setAnswers({}); setCurrent(0);
      setSecondsRemaining(Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)));
      setPhase('exam');
    } catch (startError) { setError(`We could not prepare this mock exam. ${startError?.message || 'Please try again shortly.'}`); }
    finally { setSubmitting(false); }
  };

  const finish = async () => {
    if (phase !== 'exam' || submitting) return;
    setSubmitting(true); setError('');
    try {
      const submission = Object.fromEntries(Object.entries(answers).map(([index, answer]) => [questions[Number(index)].id, answer]));
      setResult(await submitMockExamSession(sessionId, submission));
      setPhase('results');
    } catch { setError('We could not save this exam. Please try again.'); }
    finally { setSubmitting(false); }
  };

  useEffect(() => { if (phase === 'exam' && secondsRemaining === 0) finish(); }, [secondsRemaining, phase]);

  const reset = () => { setPhase('welcome'); setQuestions([]); setSessionId(null); setCurrent(0); setAnswers({}); setResult(null); setSecondsRemaining(PMP_DURATION_SECONDS); setError(''); };
  const answered = Object.keys(answers).map(Number);

  if (phase === 'welcome') return <div><PageHeader title="Mock Exam" subtitle="Focused, timed PMP practice." />{error && <p role="alert" className="form-error">{error}</p>}<div className="surface-card exam-welcome"><span className="page-eyebrow">PMP-style simulation</span><h2>Build your exam confidence.</h2><p>Your 180-question exam is selected randomly and balanced across People, Process, and Business Environment. Unanswered questions count as incorrect, and your timed-out attempt is saved automatically.</p><div className="exam-metrics"><div className="exam-metric"><strong>180</strong><span>questions assigned</span></div><div className="exam-metric"><strong>230 min</strong><span>time allowance</span></div><div className="exam-metric"><strong>Private</strong><span>results saved securely</span></div></div><button className="button-primary" type="button" disabled={submitting} onClick={start}>{submitting ? 'Preparing your exam…' : 'Start mock exam'}</button></div></div>;
  if (phase === 'results') return <div><PageHeader title="Mock exam complete" subtitle="Your result and question-by-question review." /><div className="surface-card result-card"><span className="page-eyebrow">{result?.expired ? 'Time expired — attempt saved' : 'Assessment result'}</span><div className="result-score">{result?.score || 0}<span>/ {result?.total || 180} correct</span></div><p>Your result has been saved to your learner account. Use the explanations below to direct your next study session.</p><section aria-label="Answer review">{(result?.review || []).map((item, index) => { const question = questions.find((q) => q.id === item.question_id); const selected = item.selected_index; return <article className={`review-card ${item.is_correct ? 'correct' : 'incorrect'}`} key={item.question_id}><strong className="review-status">Question {index + 1} · {item.is_correct ? 'Correct' : 'Incorrect'}</strong><p style={{ marginTop: '.5rem', fontWeight: 700 }}>{question?.text}</p><p>Your answer: {selected === null || selected === undefined ? 'Not answered' : `${String.fromCharCode(65 + selected)}. ${question?.options?.[selected] || ''}`}</p><p>Correct answer: {String.fromCharCode(65 + item.correct_index)}. {question?.options?.[item.correct_index] || ''}</p>{item.explanation && <p style={{ marginBottom: 0 }}><strong>Explanation:</strong> {item.explanation}</p>}</article>; })}</section><button className="button-primary" type="button" onClick={reset} style={{ marginTop: '1.2rem' }}>Start a new attempt</button></div></div>;

  const question = questions[current];
  return <div><PageHeader title="Mock Exam" subtitle={`Question ${current + 1} of ${questions.length}`} /><div className="surface-card exam-topbar"><div className="exam-progress"><div className="exam-progress-label"><span>Exam progress</span><span>{answered.length} of {questions.length} answered</span></div><div className="exam-progress-track"><div className="exam-progress-bar" style={{ width: `${(answered.length / questions.length) * 100}%` }} /></div></div><ExamTimer minutes={Math.floor(secondsRemaining / 60)} seconds={secondsRemaining % 60} /><button className="button-danger" type="button" disabled={submitting} onClick={finish}>{submitting ? 'Saving exam…' : 'Submit exam'}</button></div>{error && <p role="alert" className="form-error">{error}</p>}<div className="exam-layout"><div className="surface-card exam-question"><p className="question-kicker">Select one best answer</p><h2 className="question-text">{question.text}</h2><div className="answer-list">{question.options.map((option, optionIndex) => { const isSelected = answers[current] === optionIndex; return <button key={optionIndex} className={`answer-option ${isSelected ? 'selected' : ''}`} type="button" aria-pressed={isSelected} onClick={() => setAnswers((old) => ({ ...old, [current]: optionIndex }))}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></button>; })}</div><div className="question-actions"><button className="button-secondary" type="button" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}>Previous</button><button className="button-primary" type="button" disabled={current === questions.length - 1} onClick={() => setCurrent((value) => value + 1)}>Next question</button></div></div><QuestionNavigator total={questions.length} current={current} answered={answered} onSelect={setCurrent} /></div></div>;
}

export default MockExam;
