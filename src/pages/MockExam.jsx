import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';
import { getQuestions } from '../services/contentService.js';

function MockExam() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(60 * 60);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestions().then(setQuestions).catch(() => {
      setError('The approved question bank is not available yet. Please try again after an administrator has published questions.');
    });
  }, []);

  useEffect(() => {
    if (!started || finished || secondsRemaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setSecondsRemaining((remaining) => {
        if (remaining <= 1) {
          setFinished(true);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, finished, secondsRemaining]);

  const selectAnswer = (optionIndex) => {
    if (answers[currentQuestion] !== undefined) return;
    setAnswers((current) => ({ ...current, [currentQuestion]: optionIndex }));
  };
  const restartExam = () => {
    setStarted(false);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSecondsRemaining(60 * 60);
  };

  const totalQuestions = questions.length;
  const question = questions[currentQuestion];
  const correctAnswers = Object.entries(answers).reduce(
    (total, [questionIndex, selectedIndex]) => total + (questions[Number(questionIndex)]?.correctIndex === selectedIndex ? 1 : 0),
    0
  );

  return (
    <div>
      <PageHeader title="Mock Exam" subtitle="Timed PMP practice" />
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      {!error && !questions.length && <p>Loading approved questions…</p>}
      {!error && questions.length > 0 && !started ? (
        <div style={{ textAlign: 'center' }}>
          <p>This beta mock exam uses all {totalQuestions} approved questions and gives you 60 minutes.</p>
          <button type="button" onClick={() => setStarted(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Start Exam
          </button>
        </div>
      ) : !error && questions.length > 0 && !finished ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <ExamTimer minutes={Math.floor(secondsRemaining / 60)} seconds={secondsRemaining % 60} />
            <button type="button" onClick={() => setFinished(true)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              End Exam
            </button>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <QuestionNavigator total={totalQuestions} current={currentQuestion} onSelect={setCurrentQuestion} />
          </div>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
            <p style={{ color: 'var(--color-muted)' }}>Question {currentQuestion + 1} of {totalQuestions}</p>
            <h3>{question.text}</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {question.options.map((option, optionIndex) => {
                const selected = answers[currentQuestion] === optionIndex;
                return (
                  <button key={optionIndex} type="button" onClick={() => selectAnswer(optionIndex)} disabled={answers[currentQuestion] !== undefined} style={{ textAlign: 'left', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-surface)', color: selected ? '#fff' : 'inherit', cursor: answers[currentQuestion] === undefined ? 'pointer' : 'default' }}>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : !error && questions.length > 0 ? (
        <div style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto' }}>
          <h2>Mock exam complete</h2>
          <p>You answered {Object.keys(answers).length} of {totalQuestions} questions.</p>
          <p>Your score: {correctAnswers} / {totalQuestions}</p>
          <button type="button" onClick={restartExam} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Start again
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default MockExam;
