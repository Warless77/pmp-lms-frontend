import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getQuestions } from '../services/contentService.js';

/**
 * Quiz page presents a series of questions with multiple choice answers. It
 * tracks the score and provides feedback after each selection. Users can
 * restart the quiz to practise again.
 */
function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestions().then(setQuestions).catch(() => {
      setError('The question bank is not available yet. Please ask an administrator to complete the question import.');
    });
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!questions.length) {
    return <p>Loading quiz…</p>;
  }

  const question = questions[index];

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setShowExplanation(true);
    if (i === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      // Quiz complete
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setShowExplanation(false);
  };

  const completed = index === questions.length - 1 && selected !== null;

  return (
    <div>
      <PageHeader title="Quiz" subtitle="Test your knowledge" />
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p>
          Question {index + 1} of {questions.length}
        </p>
        <h4>{question.text}</h4>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = i === selected;
            let bg = 'var(--color-surface)';
            if (selected !== null) {
              if (isSelected && isCorrect) bg = 'var(--color-success)';
              else if (isSelected && !isCorrect) bg = 'var(--color-error)';
              else if (isCorrect) bg = 'var(--color-success)';
            }
            return (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: bg, cursor: selected === null ? 'pointer' : 'default' }}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
        {showExplanation && (
          <div style={{ marginTop: '1rem' }}>
            <p>{question.explanation}</p>
          </div>
        )}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          {!completed ? (
            <button
              onClick={handleNext}
              disabled={selected === null}
              style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: selected === null ? 'default' : 'pointer' }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleRestart}
              style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Restart Quiz
            </button>
          )}
          <span>
            Score: {score} / {questions.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
