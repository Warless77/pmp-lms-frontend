import React from 'react';

/**
 * QuizCard shows a question preview for the quiz page. Accepts a `question` object
 * with question text and options. It can include callback props for selection but
 * the full logic is implemented in the Quiz page.
 */
function QuizCard({ question }) {
  return (
    <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
      <p style={{ fontWeight: 600 }}>{question.text}</p>
      <ul style={{ marginTop: '0.5rem' }}>
        {question.options.map((opt, index) => (
          <li key={index}>{opt}</li>
        ))}
      </ul>
    </div>
  );
}

export default QuizCard;