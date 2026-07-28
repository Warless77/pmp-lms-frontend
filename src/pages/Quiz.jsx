import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { getPracticeQuestions, gradePracticeAnswer } from '../services/contentService.js';
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
  const [review, setReview] = useState(null);

  useEffect(() => {
    getPracticeQuestions(20, location.state?.questionId).then((items) => {
      setQuestions(items);
    }).catch(() => setError('The quiz could not be loaded. Please try again shortly.'));
  }, [location.state]);

  if (error) return <p role="alert" className="form-error">{error}</p>;
  if (!questions.length) return <p>Loading quiz…</p>;
  const question = questions[index];

  const select = async (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    try {
      const result = await gradePracticeAnswer(question.id, optionIndex);
      setReview(result);
      if (result.isCorrect) setScore((value) => value + 1);
      recordAnswer(question.id, result.isCorrect);
    } catch (gradeError) {
      setSelected(null);
      setError(`We could not grade that answer. ${gradeError?.message || 'Please try again.'}`);
    }
  };
  const next = () => {
    if (index + 1 === questions.length) setComplete(true);
    else { setIndex((value) => value + 1); setSelected(null); setReview(null); }
  };
  const restart = () => { setIndex(0); setSelected(null); setReview(null); setScore(0); setComplete(false); setQuestions([]); getPracticeQuestions().then(setQuestions).catch(() => setError('The quiz could not be loaded. Please try again shortly.')); navigate('/quiz', { replace: true }); };

  if (complete) return (
    <div><PageHeader title="Practice complete" subtitle="A focused review builds exam confidence." />
      <div className="surface-card result-card">
        <span className="page-eyebrow">Practice result</span><div className="result-score">{score}<span>/ {questions.length} correct</span></div><p>You can revisit the explanations at any time by practising again.</p>
        <button className="button-primary" type="button" onClick={restart}>Practise again</button>
      </div></div>
  );

  return (
    <div><PageHeader title="Practice Quiz" subtitle={`Question ${index + 1} of ${questions.length}`} />
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div className="surface-card exam-topbar"><div className="exam-progress"><div className="exam-progress-label"><span>Quiz progress</span><span>{index + 1}/{questions.length}</span></div><div className="exam-progress-track"><div className="exam-progress-bar" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div></div><strong style={{ color: 'var(--color-primary)', fontSize: '.88rem' }}>Score: {score}</strong></div>
        <div className="surface-card exam-question">
          <p className="question-kicker">Choose the best answer</p><h2 className="question-text">{question.text}</h2>
          <div className="answer-list">{question.options.map((option, optionIndex) => {
            const reviewed = review !== null;
            const chosen = optionIndex === selected;
            const status = reviewed && chosen ? (review.isCorrect ? 'correct' : 'incorrect') : chosen ? 'selected' : '';
            return <button key={optionIndex} className={`answer-option ${status}`} type="button" onClick={() => select(optionIndex)} disabled={reviewed}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></button>;
          })}</div>
          {review && <div className={`review-card ${review.isCorrect ? 'correct' : 'incorrect'}`}><strong className="review-status">{review.isCorrect ? 'Correct answer' : 'Review this concept'}</strong><p style={{ margin: '.45rem 0 0' }}>{review.explanation}</p></div>}
          <div className="question-actions"><button className="button-secondary" type="button" onClick={() => navigate('/questions')}>Question bank</button><button className="button-primary" type="button" onClick={next} disabled={!review}>{index + 1 === questions.length ? 'Finish quiz' : 'Next question'}</button></div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
