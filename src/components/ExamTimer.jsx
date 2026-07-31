import React from 'react';

/**
 * Simple timer display for the mock exam page. Accepts minutes and seconds.
 */
function ExamTimer({ minutes, seconds }) {
  return (
    <div className="exam-timer" aria-label={`${minutes} minutes ${seconds} seconds remaining`}>
      <span>Time left</span><strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
    </div>
  );
}

export default ExamTimer;
