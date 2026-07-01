import React from 'react';

/**
 * QuestionNavigator shows numbered buttons for navigating between questions in a
 * quiz or mock exam. Accepts total count and current index and a callback.
 */
function QuestionNavigator({ total, current, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            backgroundColor: idx === current ? 'var(--color-primary)' : 'var(--color-surface)',
            color: idx === current ? '#fff' : 'inherit',
            cursor: 'pointer'
          }}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );
}

export default QuestionNavigator;