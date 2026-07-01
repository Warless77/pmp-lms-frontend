import React from 'react';

/**
 * Simple timer display for the mock exam page. Accepts minutes and seconds.
 */
function ExamTimer({ minutes, seconds }) {
  return (
    <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'inline-block' }}>
      <span style={{ fontWeight: 700 }}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}

export default ExamTimer;