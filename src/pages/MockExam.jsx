import React, { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';

/**
 * MockExam page simulates the PMP exam environment. This shell provides a
 * timer and question navigator but does not implement full exam logic. It
 * demonstrates how the page could be structured.
 */
function MockExam() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = 10; // placeholder; real exam has 180
  const [minutes, setMinutes] = useState(230);

  const startExam = () => {
    setStarted(true);
    // Timer logic would go here
  };

  return (
    <div>
      <PageHeader title="Mock Exam" subtitle="Full length exam simulation" />
      {!started ? (
        <div style={{ textAlign: 'center' }}>
          <p>This mock exam will present 180 questions with a 230‑minute timer.</p>
          <button onClick={startExam} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Start Exam
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <ExamTimer minutes={minutes} seconds={0} />
            <button style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: '4px' }}>
              End Exam
            </button>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <QuestionNavigator total={totalQuestions} current={currentQuestion} onSelect={setCurrentQuestion} />
          </div>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
            <p>Question {currentQuestion + 1} placeholder text.</p>
            <p>Answer options and flag/review controls would appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockExam;